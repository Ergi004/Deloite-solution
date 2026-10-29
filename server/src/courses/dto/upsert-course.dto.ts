import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { CourseFormat, CourseLevel } from '../../types/enums';

export class CourseSkillInputDto {
  @IsString()
  skillId: string;

  @IsInt()
  @Min(1)
  @Max(5)
  levelGained: number;
}

export class UpsertCourseDto {
  @IsString()
  @MaxLength(200)
  title: string;

  @IsString()
  @MaxLength(150)
  provider: string;

  @IsUrl()
  url: string;

  @IsEnum(CourseFormat)
  format: CourseFormat;

  @IsEnum(CourseLevel)
  level: CourseLevel;

  @IsInt()
  @Min(1)
  estimatedHours: number;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsString()
  cost?: string;

  @IsOptional()
  @IsBoolean()
  isInternal?: boolean;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CourseSkillInputDto)
  skills: CourseSkillInputDto[];
}
