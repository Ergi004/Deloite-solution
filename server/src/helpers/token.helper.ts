import { randomBytes, createHash } from 'crypto';

/** 32+ bytes of randomness, hex-encoded, for invite tokens and refresh tokens. */
export function generateRawToken(): string {
  return randomBytes(32).toString('hex');
}

export function hashToken(rawToken: string): string {
  return createHash('sha256').update(rawToken).digest('hex');
}
