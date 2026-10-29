import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { UpsertCourseDto } from './dto/upsert-course.dto';
import { Roles } from '../decorators/roles.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { UserRole } from '../types/enums';
import { AuditService } from '../audit/audit.service';

@Controller('courses')
export class CoursesController {
  constructor(
    private readonly coursesService: CoursesService,
    private readonly auditService: AuditService,
  ) {}

  @Get()
  findAll(@CurrentUser('companyId') companyId: string) {
    return this.coursesService.findAllForCompany(companyId);
  }

  @Roles(UserRole.COMPANY_ADMIN)
  @Post()
  async create(
    @CurrentUser() user: { sub: string; companyId: string },
    @Body() dto: UpsertCourseDto,
  ) {
    const course = await this.coursesService.create(user.companyId, dto);
    await this.auditService.log({
      companyId: user.companyId,
      actorId: user.sub,
      action: 'COURSE_CREATED',
      entityType: 'Course',
      entityId: course.id,
    });
    return course;
  }

  @Roles(UserRole.COMPANY_ADMIN)
  @Put(':id')
  update(
    @Param('id') id: string,
    @CurrentUser('companyId') companyId: string,
    @Body() dto: UpsertCourseDto,
  ) {
    return this.coursesService.update(id, companyId, dto);
  }

  @Roles(UserRole.COMPANY_ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser('companyId') companyId: string) {
    return this.coursesService.remove(id, companyId);
  }
}
