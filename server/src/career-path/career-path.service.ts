import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, MoreThan, Repository } from 'typeorm';
import { CareerPath } from './entities/career-path.entity';
import { StudentsService } from '../students/students.service';
import { SkillsService } from '../skills/skills.service';
import { JobsService } from '../jobs/jobs.service';
import { CoursesService } from '../courses/courses.service';
import { UsersService } from '../users/users.service';
import { AuditService } from '../audit/audit.service';
import { GeminiClient } from './ai/gemini.client';
import { InProcessGenerationQueue } from './generation-queue';
import { normalizeStudentContext } from './ai/pipeline/normalize';
import { filterCandidates } from './ai/pipeline/filter';
import { computeFitAndGaps } from './ai/pipeline/gap';
import { generateWithAi } from './ai/pipeline/generate';
import { validateCareerPathOutput } from './ai/pipeline/validate';
import { buildFallbackCareerPath } from './ai/pipeline/fallback';
import { PROMPT_VERSION } from './ai/prompts/career-path.v1';
import { CareerPathStatus, GenerationMethod } from '../types/enums';
import { FeedbackDto } from './dto/feedback.dto';
import { GenerationConstraints } from './ai/pipeline/types';
import { CareerPathOutput } from './ai/career-path-output.schema';

const MAX_REPAIR_ATTEMPTS = 2;
const STUCK_THRESHOLD_MS = 5 * 60 * 1000;

@Injectable()
export class CareerPathService {
  private readonly logger = new Logger(CareerPathService.name);

  constructor(
    @InjectRepository(CareerPath)
    private readonly careerPathRepository: Repository<CareerPath>,
    private readonly studentsService: StudentsService,
    private readonly skillsService: SkillsService,
    private readonly jobsService: JobsService,
    private readonly coursesService: CoursesService,
    private readonly usersService: UsersService,
    private readonly auditService: AuditService,
    private readonly geminiClient: GeminiClient,
    private readonly queue: InProcessGenerationQueue,
    private readonly config: ConfigService,
  ) {}

  async requestGeneration(userId: string): Promise<CareerPath> {
    const profile = await this.studentsService.findByUserId(userId);
    if (!profile.onboardingCompletedAt) {
      throw new BadRequestException(
        'Finish onboarding before generating a career path',
      );
    }

    const limit = this.config.get<number>('AI_GENERATIONS_PER_HOUR')!;
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentCount = await this.careerPathRepository.count({
      where: { userId, createdAt: MoreThan(oneHourAgo) },
    });
    if (recentCount >= limit) {
      throw new HttpException(
        `You can only generate a career path ${limit} times per hour. Please try again later.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const existing = await this.careerPathRepository.find({
      where: { userId },
    });
    const nextVersion =
      existing.length > 0 ? Math.max(...existing.map((e) => e.version)) + 1 : 1;
    await this.careerPathRepository.update(
      { userId, status: CareerPathStatus.READY },
      { status: CareerPathStatus.SUPERSEDED },
    );

    const row = this.careerPathRepository.create({
      userId,
      version: nextVersion,
      status: CareerPathStatus.GENERATING,
    });
    const saved = await this.careerPathRepository.save(row);

    this.queue.enqueue(() => this.runPipeline(saved.id, userId));
    return saved;
  }

  async getLatest(userId: string): Promise<CareerPath | null> {
    const rows = await this.careerPathRepository.find({
      where: { userId },
      order: { version: 'DESC' },
    });
    return rows[0] ?? null;
  }

  async getStatus(id: string, userId: string): Promise<CareerPath> {
    const row = await this.careerPathRepository.findOne({
      where: { id, userId },
    });
    if (!row) throw new NotFoundException('Career path not found');
    return row;
  }

  async setFeedback(
    id: string,
    userId: string,
    dto: FeedbackDto,
  ): Promise<CareerPath> {
    const row = await this.getStatus(id, userId);
    row.feedback = dto.feedback;
    row.feedbackNote = dto.note ?? null;
    return this.careerPathRepository.save(row);
  }

  async recoverStuckGenerations(): Promise<void> {
    const threshold = new Date(Date.now() - STUCK_THRESHOLD_MS);
    const stuck = await this.careerPathRepository.find({
      where: {
        status: CareerPathStatus.GENERATING,
        createdAt: LessThan(threshold),
      },
    });
    for (const row of stuck) {
      row.status = CareerPathStatus.FAILED;
      row.validationReport = { reason: 'generation_timed_out' };
      await this.careerPathRepository.save(row);
    }
  }

  private async runPipeline(
    careerPathId: string,
    userId: string,
  ): Promise<void> {
    try {
      const [profile, userSkills, user] = await Promise.all([
        this.studentsService.findByUserId(userId),
        this.skillsService.findForUser(userId),
        this.usersService.findById(userId),
      ]);
      const companyId = user.companyId!;
      const student = normalizeStudentContext(profile, userSkills);

      const jobs =
        await this.jobsService.findOpenAndPlannedForCompany(companyId);
      const jobIds = jobs.map((j) => j.id);
      const [jobSkills, progressions, courses] = await Promise.all([
        this.jobsService.findSkillsForJobs(jobIds),
        this.jobsService.findProgressionsFrom(jobIds),
        this.coursesService.findAllForCompany(companyId),
      ]);
      const courseSkills = await this.coursesService.findSkillsForCourses(
        courses.map((c) => c.id),
      );

      const filterResult = filterCandidates(student, {
        jobs,
        jobSkills,
        progressions,
        courses,
        courseSkills,
      });

      if (!filterResult) {
        await this.patchRow(careerPathId, {
          status: CareerPathStatus.FAILED,
          validationReport: { reason: 'no_candidate_jobs' },
        });
        await this.auditService.log({
          companyId,
          actorId: userId,
          action: 'CAREER_PATH_NO_MATCH',
          entityType: 'CareerPath',
          entityId: careerPathId,
        });
        return;
      }

      const { candidateJobs } = computeFitAndGaps(student, filterResult);
      const horizonMonths = (profile.targetHorizonYears ?? 2) * 12;
      const weeklyHours = profile.weeklyLearningHours ?? 5;
      const constraints: GenerationConstraints = {
        horizonMonths,
        weeklyHours,
        maxTotalHours: Math.round(horizonMonths * 4.3 * weeklyHours * 0.8),
      };

      let output: CareerPathOutput | null = null;
      let generationMethod: GenerationMethod = GenerationMethod.FALLBACK;
      let model: string | null = null;
      let tokensIn: number | null = null;
      let tokensOut: number | null = null;
      let validationReport: Record<string, unknown> = {};

      let repairErrors: string[] | undefined;
      for (let attempt = 0; attempt <= MAX_REPAIR_ATTEMPTS; attempt++) {
        const aiResult = await generateWithAi(this.geminiClient, {
          student,
          candidateJobs,
          progressionLadders: filterResult.progressionLadders,
          candidateCourses: filterResult.candidateCourses,
          constraints,
          repairErrors,
        });
        if (!aiResult) break;

        const validation = validateCareerPathOutput(aiResult.raw, {
          candidateJobs,
          candidateCourses: filterResult.candidateCourses,
          progressionLadders: filterResult.progressionLadders,
          constraints,
        });

        if (validation.valid) {
          output = validation.data;
          generationMethod = GenerationMethod.AI;
          model = aiResult.model;
          tokensIn = aiResult.tokensIn;
          tokensOut = aiResult.tokensOut;
          validationReport = { valid: true, repairsNeeded: attempt };
          break;
        }

        repairErrors = validation.errors;
        validationReport = {
          valid: false,
          lastErrors: validation.errors,
          repairsTried: attempt + 1,
        };
      }

      if (!output) {
        output = buildFallbackCareerPath(
          student,
          candidateJobs,
          filterResult,
          constraints,
        );
        generationMethod = GenerationMethod.FALLBACK;
        model = null;
        validationReport = { ...validationReport, usedFallback: true };
      }

      await this.patchRow(careerPathId, {
        status: CareerPathStatus.READY,
        output: output,
        validationReport,
        generationMethod,
        model,
        promptVersion: PROMPT_VERSION,
        tokensIn,
        tokensOut,
        inputSnapshot: { student, constraints },
      });

      await this.auditService.log({
        companyId,
        actorId: userId,
        action: 'CAREER_PATH_GENERATED',
        entityType: 'CareerPath',
        entityId: careerPathId,
        metadata: { generationMethod },
      });
    } catch (error) {
      this.logger.error(
        `Career path generation failed: ${(error as Error).message}`,
      );
      await this.patchRow(careerPathId, {
        status: CareerPathStatus.FAILED,
        validationReport: {
          reason: 'unexpected_error',
          message: (error as Error).message,
        },
      });
    }
  }

  private async patchRow(
    id: string,
    patch: Partial<CareerPath>,
  ): Promise<void> {
    const row = await this.careerPathRepository.findOne({ where: { id } });
    if (!row) return;
    Object.assign(row, patch);
    await this.careerPathRepository.save(row);
  }
}
