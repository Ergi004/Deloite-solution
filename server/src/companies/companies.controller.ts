import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from '../types/enums';
import { CurrentUser } from '../decorators/current-user.decorator';
import { AuditService } from '../audit/audit.service';

@Controller('companies')
export class CompaniesController {
  constructor(
    private readonly companiesService: CompaniesService,
    private readonly auditService: AuditService,
  ) {}

  @Roles(UserRole.COMPANY_ADMIN)
  @Get('mine')
  findMine(@CurrentUser('companyId') companyId: string) {
    return this.companiesService.findById(companyId);
  }

  @Roles(UserRole.COMPANY_ADMIN)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCompanyDto,
    @CurrentUser() user: { sub: string; companyId: string | null },
  ) {
    const company = await this.companiesService.update(id, dto);
    await this.auditService.log({
      companyId: company.id,
      actorId: user.sub,
      action: 'COMPANY_SETTINGS_UPDATED',
      entityType: 'Company',
      entityId: company.id,
    });
    return company;
  }
}
