import { BadRequestException } from '@nestjs/common';

const COMMON_PASSWORDS = new Set([
  'password',
  'password123',
  '1234567890',
  'qwertyuiop',
  'letmein123',
  '123456789012',
  'iloveyou123',
  'admin123456',
  'welcome12345',
  'password1234',
]);

export function assertPasswordStrength(password: string): void {
  if (password.length < 10) {
    throw new BadRequestException(
      'Password must be at least 10 characters long',
    );
  }
  if (COMMON_PASSWORDS.has(password.toLowerCase())) {
    throw new BadRequestException(
      'This password is too common, please choose another one',
    );
  }
}
