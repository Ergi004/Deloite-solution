import { verify, sign, SignOptions } from 'jsonwebtoken';
import { UnauthorizedException } from '@nestjs/common';

export function signToken<T extends object>(
  payload: T,
  secret: string,
  options: SignOptions,
): string {
  return sign(payload, secret, options);
}

export function verifyAccessToken<T>(
  token: string | undefined,
  secret: string,
): T {
  if (!token) {
    throw new UnauthorizedException('Missing access token');
  }
  try {
    return verify(token, secret) as T;
  } catch {
    throw new UnauthorizedException('Invalid or expired access token');
  }
}
