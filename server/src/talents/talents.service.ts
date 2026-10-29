import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, In, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { StudentProfile } from '../students/entities/student-profile.entity';
import { CareerPath } from '../career-path/entities/career-path.entity';
import { OnboardingResponse } from '../onboarding/entities/onboarding-response.entity';
import { UserSkill } from '../skills/entities/user-skill.entity';
import { UserRole, UserStatus } from '../types/enums';

export interface TalentListFilters {
  page: number;
  pageSize: number;
  search?: string;
  status?: UserStatus;
  targetRole?: string;
}

@Injectable()
export class TalentsService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(StudentProfile)
    private readonly profileRepository: Repository<StudentProfile>,
    @InjectRepository(CareerPath)
    private readonly careerPathRepository: Repository<CareerPath>,
    @InjectRepository(OnboardingResponse)
    private readonly onboardingRepository: Repository<OnboardingResponse>,
    @InjectRepository(UserSkill)
    private readonly userSkillRepository: Repository<UserSkill>,
  ) {}

  async list(companyId: string, filters: TalentListFilters) {
    const where: Record<string, unknown> = {
      companyId,
      role: UserRole.STUDENT,
    };
    if (filters.status) where.status = filters.status;
    if (filters.search) where.email = ILike(`%${filters.search}%`);

    const [users, total] = await this.userRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (filters.page - 1) * filters.pageSize,
      take: filters.pageSize,
    });

    const userIds = users.map((u) => u.id);
    const profiles = userIds.length
      ? await this.profileRepository.find({ where: { userId: In(userIds) } })
      : [];
    const profileByUser = new Map(profiles.map((p) => [p.userId, p]));

    const latestPaths = userIds.length
      ? await this.careerPathRepository.find({
          where: { userId: In(userIds) },
          order: { version: 'DESC' },
        })
      : [];
    const latestPathByUser = new Map<string, CareerPath>();
    for (const p of latestPaths) {
      if (!latestPathByUser.has(p.userId)) latestPathByUser.set(p.userId, p);
    }

    const items = users
      .map((user) => {
        const profile = profileByUser.get(user.id);
        const latestPath = latestPathByUser.get(user.id);
        const fitScore =
          (
            latestPath?.output as {
              primaryTarget?: { fitScore?: number };
            } | null
          )?.primaryTarget?.fitScore ?? null;
        return {
          user,
          profile,
          latestPathStatus: latestPath?.status ?? null,
          fitScore,
        };
      })
      .filter(
        (item) =>
          !filters.targetRole ||
          item.profile?.targetRole === filters.targetRole,
      );

    return { items, total, page: filters.page, pageSize: filters.pageSize };
  }

  async getDetail(userId: string, companyId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId, companyId },
    });
    if (!user) throw new NotFoundException('Talent not found');

    const [profile, skills, onboardingResponses, pathHistory] =
      await Promise.all([
        this.profileRepository.findOne({ where: { userId } }),
        this.userSkillRepository.find({
          where: { userId },
          relations: { skill: true },
        }),
        this.onboardingRepository.find({ where: { userId } }),
        this.careerPathRepository.find({
          where: { userId },
          order: { version: 'DESC' },
        }),
      ]);

    return {
      user,
      profile,
      skills,
      onboardingResponses,
      pathHistory,
      latestPath: pathHistory[0] ?? null,
    };
  }

  async setStatus(
    userId: string,
    companyId: string,
    status: UserStatus,
  ): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId, companyId },
    });
    if (!user) throw new NotFoundException('Talent not found');
    await this.userRepository.update({ id: userId }, { status });
  }
}
