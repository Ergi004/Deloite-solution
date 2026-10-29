import { IsEnum, IsString, MaxLength } from 'class-validator';
import { TrackPreference } from '../../types/enums';

export class Step5CareerDirectionDto {
  @IsString()
  @MaxLength(100)
  roleFamily: string;

  @IsString()
  @MaxLength(150)
  targetRole: string;

  @IsEnum(TrackPreference)
  trackPreference: TrackPreference;
}
