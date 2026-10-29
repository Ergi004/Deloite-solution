import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Job } from './entities/job.entity';
import { JobSkill } from './entities/job-skill.entity';
import { JobProgression } from './entities/job-progression.entity';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Job, JobSkill, JobProgression]),
    AuditModule,
  ],
  controllers: [JobsController],
  providers: [JobsService],
  exports: [JobsService],
})
export class JobsModule {}
