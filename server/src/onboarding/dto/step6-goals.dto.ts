import {
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class Step6GoalsDto {
  @IsIn([1, 2, 3, 5])
  targetHorizonYears: 1 | 2 | 3 | 5;

  @IsString()
  @MaxLength(50)
  targetLevel: string;

  @IsString()
  @MaxLength(300)
  goalStatement: string;

  @IsInt()
  @Min(2)
  @Max(20)
  weeklyLearningHours: number;

  @IsArray()
  @IsString({ each: true })
  expectations: string[];

  @IsOptional()
  @IsString()
  @MaxLength(100)
  salaryExpectationBand?: string;
}
