import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { PathFeedback } from '../../types/enums';

export class FeedbackDto {
  @IsEnum(PathFeedback)
  feedback: PathFeedback;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
