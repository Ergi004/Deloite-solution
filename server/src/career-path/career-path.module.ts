import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Injectable } from '@nestjs/common';
import { CareerPath } from './entities/career-path.entity';
import { CareerPathService } from './career-path.service';
import { CareerPathController } from './career-path.controller';
import { GeminiClient } from './ai/gemini.client';
import { InProcessGenerationQueue } from './generation-queue';
import { StudentsModule } from '../students/students.module';
import { SkillsModule } from '../skills/skills.module';
import { JobsModule } from '../jobs/jobs.module';
import { CoursesModule } from '../courses/courses.module';
import { UsersModule } from '../users/users.module';
import { AuditModule } from '../audit/audit.module';

@Injectable()
class StuckGenerationRecovery {
  constructor(private readonly careerPathService: CareerPathService) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  handleCron() {
    return this.careerPathService.recoverStuckGenerations();
  }
}

@Module({
  imports: [
    TypeOrmModule.forFeature([CareerPath]),
    ScheduleModule,
    StudentsModule,
    SkillsModule,
    JobsModule,
    CoursesModule,
    UsersModule,
    AuditModule,
  ],
  controllers: [CareerPathController],
  providers: [
    CareerPathService,
    GeminiClient,
    InProcessGenerationQueue,
    StuckGenerationRecovery,
  ],
  exports: [CareerPathService],
})
export class CareerPathModule {}
