import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OnboardingResponse } from './entities/onboarding-response.entity';
import { OnboardingService } from './onboarding.service';
import { OnboardingController } from './onboarding.controller';
import { StudentsModule } from '../students/students.module';
import { SkillsModule } from '../skills/skills.module';
import { CareerPathModule } from '../career-path/career-path.module';
import { CompaniesModule } from '../companies/companies.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([OnboardingResponse]),
    StudentsModule,
    SkillsModule,
    CareerPathModule,
    CompaniesModule,
    UsersModule,
  ],
  controllers: [OnboardingController],
  providers: [OnboardingService],
  exports: [OnboardingService],
})
export class OnboardingModule {}
