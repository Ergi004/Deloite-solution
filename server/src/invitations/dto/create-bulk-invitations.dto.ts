import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsInt,
  IsOptional,
  Max,
  Min,
} from 'class-validator';

export class CreateBulkInvitationsDto {
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(200)
  @IsEmail({}, { each: true })
  emails?: string[];

  /** When emails is omitted, generate this many anonymous (email-unbound) links instead. */
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(200)
  anonymousCount?: number;
}
