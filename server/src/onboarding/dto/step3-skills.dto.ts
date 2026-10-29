import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class SkillEntryDto {
  @IsString()
  skillId: string;

  @IsInt()
  @Min(1)
  @Max(5)
  level: number;
}

export class Step3SkillsDto {
  @IsArray()
  @ArrayMinSize(3)
  @ValidateNested({ each: true })
  @Type(() => SkillEntryDto)
  skills: SkillEntryDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  certifications?: string[];
}
