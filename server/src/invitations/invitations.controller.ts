import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { InvitationsService } from './invitations.service';
import { CompaniesService } from '../companies/companies.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { CreateBulkInvitationsDto } from './dto/create-bulk-invitations.dto';
import { Public } from '../decorators/public.decorator';
import { Roles } from '../decorators/roles.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { UserRole } from '../types/enums';
import { AuditService } from '../audit/audit.service';

@Controller('invitations')
export class InvitationsController {
  constructor(
    private readonly invitationsService: InvitationsService,
    private readonly companiesService: CompaniesService,
    private readonly auditService: AuditService,
  ) {}

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Get('validate')
  validate(@Query('token') token: string) {
    return this.invitationsService.validate(token);
  }

  @Roles(UserRole.COMPANY_ADMIN)
  @Get()
  list(@CurrentUser('companyId') companyId: string) {
    return this.invitationsService.listForCompany(companyId);
  }

  @Roles(UserRole.COMPANY_ADMIN)
  @Post()
  async create(
    @CurrentUser() user: { sub: string; companyId: string },
    @Body() dto: CreateInvitationDto,
  ) {
    const company = await this.companiesService.findById(user.companyId);
    const { invitation, rawToken } = await this.invitationsService.create(
      company,
      user.sub,
      dto,
    );
    await this.auditService.log({
      companyId: company.id,
      actorId: user.sub,
      action: 'INVITATION_CREATED',
      entityType: 'Invitation',
      entityId: invitation.id,
    });
    return { invitation, url: this.buildUrl(rawToken) };
  }

  @Roles(UserRole.COMPANY_ADMIN)
  @Post('bulk')
  async createBulk(
    @CurrentUser() user: { sub: string; companyId: string },
    @Body() dto: CreateBulkInvitationsDto,
  ) {
    const company = await this.companiesService.findById(user.companyId);
    const results = await this.invitationsService.createBulk(
      company,
      user.sub,
      dto,
    );
    await this.auditService.log({
      companyId: company.id,
      actorId: user.sub,
      action: 'INVITATION_BULK_CREATED',
      entityType: 'Invitation',
      metadata: { count: results.length },
    });
    return results.map(({ invitation, rawToken }) => ({
      invitation,
      url: this.buildUrl(rawToken),
    }));
  }

  @Roles(UserRole.COMPANY_ADMIN)
  @Post(':id/revoke')
  async revoke(
    @Param('id') id: string,
    @CurrentUser() user: { sub: string; companyId: string },
  ) {
    await this.invitationsService.revoke(id, user.companyId);
    await this.auditService.log({
      companyId: user.companyId,
      actorId: user.sub,
      action: 'INVITATION_REVOKED',
      entityType: 'Invitation',
      entityId: id,
    });
    return { ok: true };
  }

  private buildUrl(rawToken: string): string {
    const webOrigin = process.env.WEB_ORIGIN ?? 'http://localhost:3000';
    return `${webOrigin}/register?token=${rawToken}`;
  }
}
