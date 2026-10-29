import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { StudentProfile } from '../students/entities/student-profile.entity';
import { CareerPath } from '../career-path/entities/career-path.entity';
import { Job } from '../jobs/entities/job.entity';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, StudentProfile, CareerPath, Job]),
    AuditModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
