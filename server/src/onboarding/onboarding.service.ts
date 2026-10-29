import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { OnboardingResponse } from './entities/onboarding-response.entity';
import { StudentsService } from '../students/students.service';
import { SkillsService } from '../skills/skills.service';
import { CareerPathService } from '../career-path/career-path.service';
import { CompaniesService } from '../companies/companies.service';
import { UsersService } from '../users/users.service';
import { Step1StudiesDto } from './dto/step1-studies.dto';
import { Step2IndustryInterestsDto } from './dto/step2-industry-interests.dto';
import { Step3SkillsDto } from './dto/step3-skills.dto';
import { Step4SoftSkillsDto } from './dto/step4-soft-skills.dto';
import { Step5CareerDirectionDto } from './dto/step5-career-direction.dto';
import { Step6GoalsDto } from './dto/step6-goals.dto';
import { CompleteOnboardingDto } from './dto/complete-onboarding.dto';
import { StudentProfile } from '../students/entities/student-profile.entity';

const STEP_DTO_MAP: Record<number, new () => object> = {
  1: Step1StudiesDto,
  2: Step2IndustryInterestsDto,
  3: Step3SkillsDto,
  4: Step4SoftSkillsDto,
  5: Step5CareerDirectionDto,
  6: Step6GoalsDto,
};

const SITUATIONAL_SCORE_MAP: Record<'A' | 'B' | 'C' | 'D', number> = {
  A: 3,
  B: 5,
  C: 2,
  D: 4,
};

@Injectable()
export class OnboardingService {
  constructor(
    @InjectRepository(OnboardingResponse)
    private readonly responseRepository: Repository<OnboardingResponse>,
    private readonly studentsService: StudentsService,
    private readonly skillsService: SkillsService,
    private readonly careerPathService: CareerPathService,
    private readonly companiesService: CompaniesService,
    private readonly usersService: UsersService,
  ) {}

  async getState(userId: string) {
    const profile = await this.studentsService.findByUserId(userId);
    const user = await this.usersService.findById(userId);
    const responses = await this.responseRepository.find({ where: { userId } });
    const byStep: Record<number, Record<string, unknown>> = {};
    for (const r of responses) byStep[r.step] = r.data;

    const [company, allSkills] = await Promise.all([
      user.companyId ? this.companiesService.findById(user.companyId) : null,
      this.skillsService.findAll(),
    ]);

    return {
      currentStep: profile.onboardingStep,
      responses: byStep,
      options: {
        industries: company?.industries ?? [],
        skills: allSkills.map((s) => ({
          id: s.id,
          name: s.name,
          category: s.category,
          roleFamilies: s.roleFamilies,
        })),
      },
    };
  }

  async saveStep(userId: string, step: number, rawBody: unknown) {
    if (step < 1 || step > 6) {
      throw new BadRequestException('Invalid onboarding step');
    }
    const profile = await this.studentsService.findByUserId(userId);
    if (step > profile.onboardingStep) {
      throw new BadRequestException(
        'You cannot skip ahead of your current onboarding step',
      );
    }

    const DtoClass = STEP_DTO_MAP[step];
    const instance = plainToInstance(DtoClass, rawBody);
    const errors = await validate(instance, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });
    if (errors.length > 0) {
      throw new BadRequestException(
        errors
          .map((e) => Object.values(e.constraints ?? {}).join(', '))
          .join('; '),
      );
    }

    const existingResponse = await this.responseRepository.findOne({
      where: { userId, step },
    });
    const responseRow =
      existingResponse ?? this.responseRepository.create({ userId, step });
    responseRow.data = instance as unknown as Record<string, unknown>;
    await this.responseRepository.save(responseRow);

    this.mirrorToProfile(profile, step, instance);
    if (step === 3) {
      const dto = instance as Step3SkillsDto;
      await this.skillsService.replaceUserSkills(
        userId,
        dto.skills.map((s) => ({ skillId: s.skillId, level: s.level })),
      );
    }

    if (step === profile.onboardingStep && profile.onboardingStep < 7) {
      profile.onboardingStep = step + 1;
    }
    await this.studentsService.save(profile);

    return this.getState(userId);
  }

  async complete(userId: string, _dto: CompleteOnboardingDto) {
    const profile = await this.studentsService.findByUserId(userId);
    const responses = await this.responseRepository.find({ where: { userId } });
    const completedSteps = new Set(responses.map((r) => r.step));
    for (let s = 1; s <= 6; s++) {
      if (!completedSteps.has(s)) {
        throw new BadRequestException(`Step ${s} is not complete yet`);
      }
    }

    const now = new Date();
    profile.consentPrivacyAt = now;
    profile.consentAiAt = now;
    profile.onboardingStep = 7;
    profile.onboardingCompletedAt = now;
    await this.studentsService.save(profile);

    const careerPath = await this.careerPathService.requestGeneration(userId);
    return { profile, careerPath };
  }

  private mirrorToProfile(
    profile: StudentProfile,
    step: number,
    instance: object,
  ): void {
    switch (step) {
      case 1: {
        const d = instance as Step1StudiesDto;
        profile.fieldOfStudy = d.fieldOfStudy;
        profile.degreeLevel = d.degreeLevel;
        profile.university = d.university;
        profile.graduationYear = d.graduationYear;
        profile.gpa = d.gpa != null ? String(d.gpa) : null;
        profile.notableProjects = d.notableProjects ?? null;
        profile.languages = d.languages ?? null;
        break;
      }
      case 2: {
        const d = instance as Step2IndustryInterestsDto;
        profile.preferredIndustry = d.preferredIndustry;
        profile.interests = d.interests;
        profile.dayToDayPreferences = d.dayToDayPreferences;
        profile.dayToDayOther = d.dayToDayOther ?? null;
        break;
      }
      case 4: {
        const d = instance as Step4SoftSkillsDto;
        profile.softSkillsSelf = {
          communication: d.communication,
          teamwork: d.teamwork,
          leadership: d.leadership,
          problemSolving: d.problemSolving,
          timeManagement: d.timeManagement,
          adaptability: d.adaptability,
          creativity: d.creativity,
        };
        profile.softSkillsSituational = {
          conflict: SITUATIONAL_SCORE_MAP[d.conflictAnswer],
          deadline: SITUATIONAL_SCORE_MAP[d.deadlineAnswer],
          feedback: SITUATIONAL_SCORE_MAP[d.feedbackAnswer],
        };
        break;
      }
      case 5: {
        const d = instance as Step5CareerDirectionDto;
        profile.roleFamily = d.roleFamily;
        profile.targetRole = d.targetRole;
        profile.trackPreference = d.trackPreference;
        break;
      }
      case 6: {
        const d = instance as Step6GoalsDto;
        profile.targetHorizonYears = d.targetHorizonYears;
        profile.targetLevel = d.targetLevel;
        profile.goalStatement = d.goalStatement;
        profile.weeklyLearningHours = d.weeklyLearningHours;
        profile.expectations = d.expectations;
        profile.salaryExpectationBand = d.salaryExpectationBand ?? null;
        break;
      }
      default:
        break;
    }
  }
}
