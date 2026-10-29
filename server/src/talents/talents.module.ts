import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { StudentProfile } from '../students/entities/student-profile.entity';
import { CareerPath } from '../career-path/entities/career-path.entity';
import { OnboardingResponse } from '../onboarding/entities/onboarding-response.entity';
import { UserSkill } from '../skills/entities/user-skill.entity';
import { TalentsService } from './talents.service';
import { TalentsController } from './talents.controller';
import { CareerPathModule } from '../career-path/career-path.module';
import { InvitationsModule } from '../invitations/invitations.module';
import { CompaniesModule } from '../companies/companies.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      StudentProfile,
      CareerPath,
      OnboardingResponse,
      UserSkill,
    ]),
    CareerPathModule,
    InvitationsModule,
    CompaniesModule,
    AuditModule,
  ],
  controllers: [TalentsController],
  providers: [TalentsService],
})
export class TalentsModule {}
