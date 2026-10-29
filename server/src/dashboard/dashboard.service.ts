import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { StudentProfile } from '../students/entities/student-profile.entity';
import { CareerPath } from '../career-path/entities/career-path.entity';
import { Job } from '../jobs/entities/job.entity';
import { AuditService } from '../audit/audit.service';
import { CareerPathStatus, JobStatus, UserRole } from '../types/enums';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(StudentProfile)
    private readonly profileRepository: Repository<StudentProfile>,
    @InjectRepository(CareerPath)
    private readonly careerPathRepository: Repository<CareerPath>,
    @InjectRepository(Job) private readonly jobRepository: Repository<Job>,
    private readonly auditService: AuditService,
  ) {}

  async getSummary(companyId: string) {
    const students = await this.userRepository.find({
      where: { companyId, role: UserRole.STUDENT },
    });
    const studentIds = students.map((s) => s.id);
    const profiles = studentIds.length
      ? await this.profileRepository.find({ where: { userId: In(studentIds) } })
      : [];

    const totalTalents = students.length;
    const completed = profiles.filter((p) => p.onboardingCompletedAt).length;
    const onboardingCompletionPct =
      totalTalents > 0 ? Math.round((completed / totalTalents) * 100) : 0;

    const openJobs = await this.jobRepository.count({
      where: { companyId, status: JobStatus.OPEN },
    });

    const readyPaths = studentIds.length
      ? await this.careerPathRepository.find({
          where: { userId: In(studentIds), status: CareerPathStatus.READY },
        })
      : [];

    const fitScores = readyPaths
      .map(
        (p) =>
          (p.output as { primaryTarget?: { fitScore?: number } } | null)
            ?.primaryTarget?.fitScore,
      )
      .filter((v): v is number => typeof v === 'number');
    const averageFitScore =
      fitScores.length > 0
        ? Math.round(fitScores.reduce((a, b) => a + b, 0) / fitScores.length)
        : null;

    const talentsByTargetRole: Record<string, number> = {};
    for (const p of profiles) {
      const key = p.targetRole ?? 'Not set';
      talentsByTargetRole[key] = (talentsByTargetRole[key] ?? 0) + 1;
    }

    const skillGapCounts: Record<string, { name: string; count: number }> = {};
    for (const p of readyPaths) {
      const gaps =
        (p.output as { skillGaps?: { skillId: string; name: string }[] } | null)
          ?.skillGaps ?? [];
      for (const gap of gaps) {
        skillGapCounts[gap.skillId] = skillGapCounts[gap.skillId] ?? {
          name: gap.name,
          count: 0,
        };
        skillGapCounts[gap.skillId].count += 1;
      }
    }
    const topSkillGaps = Object.entries(skillGapCounts)
      .map(([skillId, v]) => ({ skillId, name: v.name, count: v.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const onboardingFunnelByStep: Record<number, number> = {};
    for (const p of profiles) {
      onboardingFunnelByStep[p.onboardingStep] =
        (onboardingFunnelByStep[p.onboardingStep] ?? 0) + 1;
    }

    const recentActivity = await this.auditService.findForCompany(
      companyId,
      20,
    );

    return {
      totalTalents,
      onboardingCompletionPct,
      pathsGenerated: readyPaths.length,
      openJobs,
      averageFitScore,
      talentsByTargetRole,
      topSkillGaps,
      onboardingFunnelByStep,
      recentActivity,
    };
  }
}
