import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsOptional()
  @IsString()
  token?: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(10)
  password: string;

  @IsBoolean()
  consentPrivacy: boolean;
}
