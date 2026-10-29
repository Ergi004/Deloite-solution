import { Response } from 'express';

const ACCESS_COOKIE = 'access_token';
const REFRESH_COOKIE = 'refresh_token';

export function setAuthCookies(
  res: Response,
  tokens: { accessToken: string; refreshToken: string },
  refreshTtlDays: number,
): void {
  const isProd = process.env.NODE_ENV === 'production';
  const common = {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax' as const,
    path: '/',
  };
  res.cookie(ACCESS_COOKIE, tokens.accessToken, {
    ...common,
    maxAge: 15 * 60 * 1000,
  });
  res.cookie(REFRESH_COOKIE, tokens.refreshToken, {
    ...common,
    maxAge: refreshTtlDays * 24 * 60 * 60 * 1000,
  });
}

export function clearAuthCookies(res: Response): void {
  res.clearCookie(ACCESS_COOKIE, { path: '/' });
  res.clearCookie(REFRESH_COOKIE, { path: '/' });
}

export { ACCESS_COOKIE, REFRESH_COOKIE };
