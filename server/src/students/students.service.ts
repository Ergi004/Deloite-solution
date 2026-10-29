import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { StudentProfile } from './entities/student-profile.entity';
import { User } from '../users/entities/user.entity';
import { UserSkill } from '../skills/entities/user-skill.entity';
import { OnboardingResponse } from '../onboarding/entities/onboarding-response.entity';
import { CareerPath } from '../career-path/entities/career-path.entity';
import { RefreshToken } from '../users/entities/refresh-token.entity';
import { UserStatus } from '../types/enums';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(StudentProfile)
    private readonly profileRepository: Repository<StudentProfile>,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  createEmptyProfile(userId: string): StudentProfile {
    return this.profileRepository.create({ userId, onboardingStep: 1 });
  }

  async findByUserId(userId: string): Promise<StudentProfile> {
    const profile = await this.profileRepository.findOne({ where: { userId } });
    if (!profile) {
      throw new NotFoundException('Student profile not found');
    }
    return profile;
  }

  async save(profile: StudentProfile): Promise<StudentProfile> {
    return this.profileRepository.save(profile);
  }

  getRepository(): Repository<StudentProfile> {
    return this.profileRepository;
  }

  async anonymizeAndDelete(userId: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      await manager.delete(UserSkill, { userId });
      await manager.delete(OnboardingResponse, { userId });
      await manager.delete(CareerPath, { userId });
      await manager.delete(RefreshToken, { userId });
      await manager.delete(StudentProfile, { userId });
      await manager.update(
        User,
        { id: userId },
        {
          email: `deleted-${userId}@deleted.local`,
          passwordHash: '',
          status: UserStatus.ARCHIVED,
        },
      );
    });
  }
}
