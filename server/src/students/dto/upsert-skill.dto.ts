import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { SkillSource } from '../../types/enums';

export class UpsertSkillDto {
  @IsString()
  skillId: string;

  @IsInt()
  @Min(1)
  @Max(5)
  level: number;

  @IsOptional()
  @IsEnum(SkillSource)
  source?: SkillSource;
}
