import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateProgressionDto {
  @IsString()
  fromJobId: string;

  @IsString()
  toJobId: string;

  @IsInt()
  @Min(1)
  typicalMonths: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
