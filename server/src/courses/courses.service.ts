import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import { Course } from './entities/course.entity';
import { CourseSkill } from './entities/course-skill.entity';
import { UpsertCourseDto } from './dto/upsert-course.dto';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(CourseSkill)
    private readonly courseSkillRepository: Repository<CourseSkill>,
  ) {}

  async findAllForCompany(companyId: string): Promise<Course[]> {
    return this.courseRepository.find({
      where: [{ companyId: IsNull() }, { companyId }],
      order: { title: 'ASC' },
    });
  }

  async findByIds(ids: string[]): Promise<Course[]> {
    if (ids.length === 0) return [];
    return this.courseRepository.find({ where: { id: In(ids) } });
  }

  async findSkillsForCourses(courseIds: string[]): Promise<CourseSkill[]> {
    if (courseIds.length === 0) return [];
    return this.courseSkillRepository.find({
      where: { courseId: In(courseIds) },
    });
  }

  async create(companyId: string, dto: UpsertCourseDto): Promise<Course> {
    const course = this.courseRepository.create({
      companyId,
      title: dto.title,
      provider: dto.provider,
      url: dto.url,
      format: dto.format,
      level: dto.level,
      estimatedHours: dto.estimatedHours,
      language: dto.language ?? 'English',
      cost: dto.cost ?? 'Free',
      isInternal: dto.isInternal ?? false,
    });
    const saved = await this.courseRepository.save(course);
    await this.setSkills(saved.id, dto.skills);
    return saved;
  }

  async update(
    id: string,
    companyId: string,
    dto: UpsertCourseDto,
  ): Promise<Course> {
    const course = await this.courseRepository.findOne({ where: { id } });
    if (!course) throw new NotFoundException('Course not found');
    if (course.companyId !== companyId) {
      throw new ForbiddenException('Global courses cannot be edited');
    }
    Object.assign(course, {
      title: dto.title,
      provider: dto.provider,
      url: dto.url,
      format: dto.format,
      level: dto.level,
      estimatedHours: dto.estimatedHours,
      language: dto.language ?? course.language,
      cost: dto.cost ?? course.cost,
      isInternal: dto.isInternal ?? course.isInternal,
    });
    const saved = await this.courseRepository.save(course);
    await this.setSkills(saved.id, dto.skills);
    return saved;
  }

  async remove(id: string, companyId: string): Promise<void> {
    const course = await this.courseRepository.findOne({ where: { id } });
    if (!course) throw new NotFoundException('Course not found');
    if (course.companyId !== companyId) {
      throw new ForbiddenException('Global courses cannot be deleted');
    }
    await this.courseRepository.delete({ id });
  }

  private async setSkills(
    courseId: string,
    skills: { skillId: string; levelGained: number }[],
  ): Promise<void> {
    await this.courseSkillRepository.delete({ courseId });
    const rows = skills.map((s) =>
      this.courseSkillRepository.create({
        courseId,
        skillId: s.skillId,
        levelGained: s.levelGained,
      }),
    );
    await this.courseSkillRepository.save(rows);
  }
}
