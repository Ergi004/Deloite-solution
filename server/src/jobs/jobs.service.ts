import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Job } from './entities/job.entity';
import { JobSkill } from './entities/job-skill.entity';
import { JobProgression } from './entities/job-progression.entity';
import { UpsertJobDto } from './dto/upsert-job.dto';
import { CreateProgressionDto } from './dto/create-progression.dto';
import { JobStatus } from '../types/enums';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job) private readonly jobRepository: Repository<Job>,
    @InjectRepository(JobSkill)
    private readonly jobSkillRepository: Repository<JobSkill>,
    @InjectRepository(JobProgression)
    private readonly progressionRepository: Repository<JobProgression>,
  ) {}

  findAllForCompany(companyId: string): Promise<Job[]> {
    return this.jobRepository.find({
      where: { companyId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, companyId: string): Promise<Job> {
    const job = await this.jobRepository.findOne({ where: { id, companyId } });
    if (!job) throw new NotFoundException('Job not found');
    return job;
  }

  findByIds(ids: string[]): Promise<Job[]> {
    if (ids.length === 0) return Promise.resolve([]);
    return this.jobRepository.find({ where: { id: In(ids) } });
  }

  findOpenAndPlannedForCompany(companyId: string): Promise<Job[]> {
    return this.jobRepository.find({
      where: { companyId, status: In([JobStatus.OPEN, JobStatus.PLANNED]) },
    });
  }

  async findSkillsForJobs(jobIds: string[]): Promise<JobSkill[]> {
    if (jobIds.length === 0) return [];
    return this.jobSkillRepository.find({
      where: { jobId: In(jobIds) },
      relations: { skill: true },
    });
  }

  async findProgressionsFrom(jobIds: string[]): Promise<JobProgression[]> {
    if (jobIds.length === 0) return [];
    return this.progressionRepository.find({
      where: { fromJobId: In(jobIds) },
      relations: { toJob: true },
    });
  }

  async create(companyId: string, dto: UpsertJobDto): Promise<Job> {
    const job = this.jobRepository.create({
      companyId,
      code: dto.code,
      title: dto.title,
      department: dto.department,
      roleFamily: dto.roleFamily,
      industry: dto.industry,
      seniority: dto.seniority,
      employmentType: dto.employmentType ?? 'Full-time',
      location: dto.location,
      workMode: dto.workMode,
      salaryMin: dto.salaryMin ?? null,
      salaryMax: dto.salaryMax ?? null,
      salaryCurrency: dto.salaryCurrency ?? null,
      openings: dto.openings ?? 1,
      status: dto.status ?? JobStatus.DRAFT,
      targetStartDate: dto.targetStartDate ?? null,
      closingDate: dto.closingDate ?? null,
      summary: dto.summary,
      responsibilities: dto.responsibilities,
      niceToHaveSkills: dto.niceToHaveSkills ?? null,
      toolsAndTech: dto.toolsAndTech,
      educationRequirement: dto.educationRequirement,
      minYearsExperience: String(dto.minYearsExperience),
      languages: dto.languages,
      softSkillRequirements: dto.softSkillRequirements,
      monthsToProductivity: dto.monthsToProductivity,
      promotionCriteria: dto.promotionCriteria,
      reportsTo: dto.reportsTo ?? null,
      teamSize: dto.teamSize ?? null,
    });
    const saved = await this.jobRepository.save(job);
    await this.setSkills(saved.id, dto.skills);
    return saved;
  }

  async update(id: string, companyId: string, dto: UpsertJobDto): Promise<Job> {
    const job = await this.findOne(id, companyId);
    Object.assign(job, {
      ...dto,
      minYearsExperience: String(dto.minYearsExperience),
      niceToHaveSkills: dto.niceToHaveSkills ?? null,
      reportsTo: dto.reportsTo ?? null,
      teamSize: dto.teamSize ?? null,
    });
    const saved = await this.jobRepository.save(job);
    await this.setSkills(saved.id, dto.skills);
    return saved;
  }

  async duplicate(id: string, companyId: string): Promise<Job> {
    const original = await this.findOne(id, companyId);
    const skills = await this.jobSkillRepository.find({ where: { jobId: id } });
    const copy = this.jobRepository.create({
      ...original,
      id: undefined,
      code: `${original.code}-COPY`,
      title: `${original.title} (Copy)`,
      status: JobStatus.DRAFT,
    });
    const saved = await this.jobRepository.save(copy);
    if (skills.length > 0) {
      const rows = skills.map((s) =>
        this.jobSkillRepository.create({
          jobId: saved.id,
          skillId: s.skillId,
          minLevel: s.minLevel,
          weight: s.weight,
          isRequired: s.isRequired,
        }),
      );
      await this.jobSkillRepository.save(rows);
    }
    return saved;
  }

  async publish(id: string, companyId: string): Promise<Job> {
    const job = await this.findOne(id, companyId);
    const skills = await this.jobSkillRepository.find({
      where: { jobId: id, isRequired: true },
    });
    if (skills.length < 3) {
      throw new BadRequestException(
        'A job needs at least 3 required skills before publishing',
      );
    }
    if (job.responsibilities.length < 3) {
      throw new BadRequestException(
        'A job needs at least 3 responsibilities before publishing',
      );
    }
    if (job.promotionCriteria.length < 2) {
      throw new BadRequestException(
        'A job needs at least 2 promotion criteria before publishing',
      );
    }
    job.status = JobStatus.OPEN;
    return this.jobRepository.save(job);
  }

  async close(id: string, companyId: string): Promise<Job> {
    const job = await this.findOne(id, companyId);
    job.status = JobStatus.CLOSED;
    return this.jobRepository.save(job);
  }

  async createProgression(
    companyId: string,
    dto: CreateProgressionDto,
  ): Promise<JobProgression> {
    await this.findOne(dto.fromJobId, companyId);
    await this.findOne(dto.toJobId, companyId);
    const row = this.progressionRepository.create(dto);
    return this.progressionRepository.save(row);
  }

  private async setSkills(
    jobId: string,
    skills: UpsertJobDto['skills'],
  ): Promise<void> {
    await this.jobSkillRepository.delete({ jobId });
    if (!skills || skills.length === 0) return;
    const rows = skills.map((s) =>
      this.jobSkillRepository.create({
        jobId,
        skillId: s.skillId,
        minLevel: s.minLevel,
        weight: s.weight,
        isRequired: s.isRequired ?? true,
      }),
    );
    await this.jobSkillRepository.save(rows);
  }
}
