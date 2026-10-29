import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class Step2IndustryInterestsDto {
  @IsString()
  @MaxLength(100)
  preferredIndustry: string;

  @IsArray()
  @ArrayMinSize(3)
  @ArrayMaxSize(8)
  @IsString({ each: true })
  interests: string[];

  @IsArray()
  @IsString({ each: true })
  dayToDayPreferences: string[];

  @IsOptional()
  @IsString()
  @MaxLength(500)
  dayToDayOther?: string;
}
