import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { JobStatus, Seniority, WorkMode } from '../../types/enums';

export class JobSkillInputDto {
  @IsString()
  skillId: string;

  @IsInt()
  @Min(1)
  @Max(5)
  minLevel: number;

  @IsInt()
  @Min(1)
  @Max(5)
  weight: number;

  @IsOptional()
  isRequired?: boolean;
}

export class UpsertJobDto {
  @IsString()
  @MaxLength(30)
  code: string;

  @IsString()
  @MaxLength(150)
  title: string;

  @IsString()
  @MaxLength(100)
  department: string;

  @IsString()
  @MaxLength(100)
  roleFamily: string;

  @IsString()
  @MaxLength(100)
  industry: string;

  @IsEnum(Seniority)
  seniority: Seniority;

  @IsOptional()
  @IsString()
  employmentType?: string;

  @IsString()
  @MaxLength(150)
  location: string;

  @IsEnum(WorkMode)
  workMode: WorkMode;

  @IsOptional()
  @IsNumber()
  salaryMin?: number;

  @IsOptional()
  @IsNumber()
  salaryMax?: number;

  @IsOptional()
  @IsString()
  salaryCurrency?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  openings?: number;

  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus;

  @IsOptional()
  @IsString()
  targetStartDate?: string;

  @IsOptional()
  @IsString()
  closingDate?: string;

  @IsString()
  @MaxLength(1000)
  summary: string;

  @IsArray()
  @IsString({ each: true })
  responsibilities: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  niceToHaveSkills?: string[];

  @IsArray()
  @IsString({ each: true })
  toolsAndTech: string[];

  @IsString()
  @MaxLength(200)
  educationRequirement: string;

  @IsNumber()
  @Min(0)
  minYearsExperience: number;

  @IsArray()
  @IsString({ each: true })
  languages: string[];

  @IsArray()
  @IsString({ each: true })
  softSkillRequirements: string[];

  @IsInt()
  @Min(0)
  monthsToProductivity: number;

  @IsArray()
  @IsString({ each: true })
  promotionCriteria: string[];

  @IsOptional()
  @IsString()
  reportsTo?: string;

  @IsOptional()
  @IsInt()
  teamSize?: number;

  @IsArray()
  @ArrayMinSize(0)
  @ValidateNested({ each: true })
  @Type(() => JobSkillInputDto)
  skills: JobSkillInputDto[];
}
