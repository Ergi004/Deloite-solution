import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class LanguageEntryDto {
  @IsString()
  language: string;

  @IsString()
  level: string;
}

export class Step1StudiesDto {
  @IsString()
  @MaxLength(150)
  fieldOfStudy: string;

  @IsString()
  @MaxLength(50)
  degreeLevel: string;

  @IsString()
  @MaxLength(150)
  university: string;

  @IsInt()
  @Min(1950)
  @Max(2100)
  graduationYear: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(4)
  gpa?: number;

  @IsOptional()
  @IsString()
  @MaxLength(800)
  notableProjects?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => LanguageEntryDto)
  languages?: LanguageEntryDto[];
}
