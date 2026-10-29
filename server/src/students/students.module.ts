import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentProfile } from './entities/student-profile.entity';
import { UserSkill } from '../skills/entities/user-skill.entity';
import { OnboardingResponse } from '../onboarding/entities/onboarding-response.entity';
import { CareerPath } from '../career-path/entities/career-path.entity';
import { RefreshToken } from '../users/entities/refresh-token.entity';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { SkillsModule } from '../skills/skills.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StudentProfile,
      UserSkill,
      OnboardingResponse,
      CareerPath,
      RefreshToken,
    ]),
    SkillsModule,
    UsersModule,
  ],
  controllers: [StudentsController],
  providers: [StudentsService],
  exports: [StudentsService],
})
export class StudentsModule {}
