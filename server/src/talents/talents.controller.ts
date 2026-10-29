import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { TalentsService } from './talents.service';
import { CareerPathService } from '../career-path/career-path.service';
import { InvitationsService } from '../invitations/invitations.service';
import { CompaniesService } from '../companies/companies.service';
import { AuditService } from '../audit/audit.service';
import { Roles } from '../decorators/roles.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { UserRole, UserStatus } from '../types/enums';

@Roles(UserRole.COMPANY_ADMIN)
@Controller('talents')
export class TalentsController {
  constructor(
    private readonly talentsService: TalentsService,
    private readonly careerPathService: CareerPathService,
    private readonly invitationsService: InvitationsService,
    private readonly companiesService: CompaniesService,
    private readonly auditService: AuditService,
  ) {}

  @Get()
  list(
    @CurrentUser('companyId') companyId: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('search') search?: string,
    @Query('status') status?: UserStatus,
    @Query('targetRole') targetRole?: string,
  ) {
    return this.talentsService.list(companyId, {
      page: page ? parseInt(page, 10) : 1,
      pageSize: pageSize ? parseInt(pageSize, 10) : 20,
      search,
      status,
      targetRole,
    });
  }

  @Get(':id')
  getDetail(
    @Param('id') id: string,
    @CurrentUser('companyId') companyId: string,
  ) {
    return this.talentsService.getDetail(id, companyId);
  }

  @Post(':id/archive')
  async archive(
    @Param('id') id: string,
    @CurrentUser() user: { sub: string; companyId: string },
  ) {
    await this.talentsService.setStatus(
      id,
      user.companyId,
      UserStatus.ARCHIVED,
    );
    await this.auditService.log({
      companyId: user.companyId,
      actorId: user.sub,
      action: 'TALENT_ARCHIVED',
      entityType: 'User',
      entityId: id,
    });
    return { ok: true };
  }

  @Post(':id/restore')
  async restore(
    @Param('id') id: string,
    @CurrentUser() user: { sub: string; companyId: string },
  ) {
    await this.talentsService.setStatus(id, user.companyId, UserStatus.ACTIVE);
    await this.auditService.log({
      companyId: user.companyId,
      actorId: user.sub,
      action: 'TALENT_RESTORED',
      entityType: 'User',
      entityId: id,
    });
    return { ok: true };
  }

  @Post(':id/regenerate-path')
  regeneratePath(@Param('id') id: string) {
    return this.careerPathService.requestGeneration(id);
  }

  @Post(':id/resend-invite')
  async resendInvite(
    @Param('id') id: string,
    @CurrentUser() user: { sub: string; companyId: string },
    @Body('email') email: string,
  ) {
    const company = await this.companiesService.findById(user.companyId);
    const { invitation, rawToken } = await this.invitationsService.create(
      company,
      user.sub,
      { email },
    );
    await this.auditService.log({
      companyId: user.companyId,
      actorId: user.sub,
      action: 'INVITATION_RESENT',
      entityType: 'Invitation',
      entityId: invitation.id,
      metadata: { talentId: id },
    });
    return {
      url: `${process.env.WEB_ORIGIN ?? 'http://localhost:3000'}/register?token=${rawToken}`,
    };
  }
}
