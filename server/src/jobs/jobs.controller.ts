import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { UpsertJobDto } from './dto/upsert-job.dto';
import { CreateProgressionDto } from './dto/create-progression.dto';
import { Roles } from '../decorators/roles.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { UserRole } from '../types/enums';
import { AuditService } from '../audit/audit.service';

@Controller('jobs')
export class JobsController {
  constructor(
    private readonly jobsService: JobsService,
    private readonly auditService: AuditService,
  ) {}

  @Get()
  findAll(@CurrentUser('companyId') companyId: string) {
    return this.jobsService.findAllForCompany(companyId);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser('companyId') companyId: string,
  ) {
    const job = await this.jobsService.findOne(id, companyId);
    const skills = await this.jobsService.findSkillsForJobs([id]);
    return {
      ...job,
      skills: skills.map((s) => ({
        skillId: s.skillId,
        minLevel: s.minLevel,
        weight: s.weight,
        isRequired: s.isRequired,
      })),
    };
  }

  @Roles(UserRole.COMPANY_ADMIN)
  @Post()
  create(
    @CurrentUser('companyId') companyId: string,
    @Body() dto: UpsertJobDto,
  ) {
    return this.jobsService.create(companyId, dto);
  }

  @Roles(UserRole.COMPANY_ADMIN)
  @Put(':id')
  update(
    @Param('id') id: string,
    @CurrentUser('companyId') companyId: string,
    @Body() dto: UpsertJobDto,
  ) {
    return this.jobsService.update(id, companyId, dto);
  }

  @Roles(UserRole.COMPANY_ADMIN)
  @Post(':id/duplicate')
  duplicate(
    @Param('id') id: string,
    @CurrentUser('companyId') companyId: string,
  ) {
    return this.jobsService.duplicate(id, companyId);
  }

  @Roles(UserRole.COMPANY_ADMIN)
  @Post(':id/publish')
  async publish(
    @Param('id') id: string,
    @CurrentUser() user: { sub: string; companyId: string },
  ) {
    const job = await this.jobsService.publish(id, user.companyId);
    await this.auditService.log({
      companyId: user.companyId,
      actorId: user.sub,
      action: 'JOB_PUBLISHED',
      entityType: 'Job',
      entityId: job.id,
    });
    return job;
  }

  @Roles(UserRole.COMPANY_ADMIN)
  @Post(':id/close')
  async close(
    @Param('id') id: string,
    @CurrentUser() user: { sub: string; companyId: string },
  ) {
    const job = await this.jobsService.close(id, user.companyId);
    await this.auditService.log({
      companyId: user.companyId,
      actorId: user.sub,
      action: 'JOB_CLOSED',
      entityType: 'Job',
      entityId: job.id,
    });
    return job;
  }

  @Roles(UserRole.COMPANY_ADMIN)
  @Post('progressions')
  createProgression(
    @CurrentUser('companyId') companyId: string,
    @Body() dto: CreateProgressionDto,
  ) {
    return this.jobsService.createProgression(companyId, dto);
  }
}
