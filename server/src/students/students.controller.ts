import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { StudentsService } from './students.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpsertSkillDto } from './dto/upsert-skill.dto';
import { CurrentUser } from '../decorators/current-user.decorator';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from '../types/enums';
import { SkillsService } from '../skills/skills.service';
import { UsersService } from '../users/users.service';

const AVATAR_UPLOAD_DIR = process.env.AVATAR_UPLOAD_DIR ?? './uploads/avatars';

@Roles(UserRole.STUDENT)
@Controller('students/me')
export class StudentsController {
  constructor(
    private readonly studentsService: StudentsService,
    private readonly skillsService: SkillsService,
    private readonly usersService: UsersService,
  ) {}

  @Get()
  async findMe(@CurrentUser('sub') userId: string) {
    const [profile, user, skills] = await Promise.all([
      this.studentsService.findByUserId(userId),
      this.usersService.findById(userId),
      this.skillsService.findForUser(userId),
    ]);
    return { profile, email: user.email, skills };
  }

  @Patch()
  async update(
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    const profile = await this.studentsService.findByUserId(userId);
    Object.assign(profile, dto);
    return this.studentsService.save(profile);
  }

  @Post('avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: AVATAR_UPLOAD_DIR,
        filename: (_req, file, cb) =>
          cb(null, `${uuidv4()}${extname(file.originalname)}`),
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!/^image\/(png|jpe?g|webp)$/.test(file.mimetype)) {
          return cb(
            new Error('Only PNG, JPEG, or WEBP images are allowed'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async uploadAvatar(
    @CurrentUser('sub') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const profile = await this.studentsService.findByUserId(userId);
    profile.avatarUrl = `/uploads/avatars/${file.filename}`;
    await this.studentsService.save(profile);
    return { avatarUrl: profile.avatarUrl };
  }

  @Get('skills')
  async listSkills(@CurrentUser('sub') userId: string) {
    return this.skillsService.findForUser(userId);
  }

  @Post('skills')
  async upsertSkill(
    @CurrentUser('sub') userId: string,
    @Body() dto: UpsertSkillDto,
  ) {
    return this.skillsService.upsertOne(userId, dto);
  }

  @Delete('skills/:skillId')
  async removeSkill(
    @CurrentUser('sub') userId: string,
    @Param('skillId') skillId: string,
  ) {
    await this.skillsService.removeOne(userId, skillId);
    return { ok: true };
  }

  @Get('export')
  async exportData(@CurrentUser('sub') userId: string) {
    const [profile, user, skills] = await Promise.all([
      this.studentsService.findByUserId(userId),
      this.usersService.findById(userId),
      this.skillsService.findForUser(userId),
    ]);
    return {
      exportedAt: new Date().toISOString(),
      account: {
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      profile,
      skills,
    };
  }

  @Delete()
  async deleteAccount(@CurrentUser('sub') userId: string) {
    await this.studentsService.anonymizeAndDelete(userId);
    return { ok: true };
  }
}
