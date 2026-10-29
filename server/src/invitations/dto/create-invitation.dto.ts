import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateInvitationDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  note?: string;
}
