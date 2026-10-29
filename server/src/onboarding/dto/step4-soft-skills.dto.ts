import { IsIn, IsInt, Max, Min } from 'class-validator';

const SELF_RATING_KEYS = [
  'communication',
  'teamwork',
  'leadership',
  'problemSolving',
  'timeManagement',
  'adaptability',
  'creativity',
] as const;

export class Step4SoftSkillsDto {
  @IsInt() @Min(1) @Max(5) communication: number;
  @IsInt() @Min(1) @Max(5) teamwork: number;
  @IsInt() @Min(1) @Max(5) leadership: number;
  @IsInt() @Min(1) @Max(5) problemSolving: number;
  @IsInt() @Min(1) @Max(5) timeManagement: number;
  @IsInt() @Min(1) @Max(5) adaptability: number;
  @IsInt() @Min(1) @Max(5) creativity: number;

  @IsIn(['A', 'B', 'C', 'D'])
  conflictAnswer: 'A' | 'B' | 'C' | 'D';

  @IsIn(['A', 'B', 'C', 'D'])
  deadlineAnswer: 'A' | 'B' | 'C' | 'D';

  @IsIn(['A', 'B', 'C', 'D'])
  feedbackAnswer: 'A' | 'B' | 'C' | 'D';
}

export { SELF_RATING_KEYS };
