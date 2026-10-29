import { ForbiddenException } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * Cookie-based auth has no CSRF protection by default. Since every mutating request is
 * same-site (web proxies /api/* to this server), a strict Origin check is enough defense
 * without the extra round-trip of a double-submit token.
 */
export function csrfProtection(allowedOrigin: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (SAFE_METHODS.has(req.method)) {
      return next();
    }
    const origin = req.headers.origin ?? req.headers.referer;
    if (!origin || !origin.startsWith(allowedOrigin)) {
      throw new ForbiddenException('Cross-origin request blocked');
    }
    return next();
  };
}
