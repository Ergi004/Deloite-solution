import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { verifyAccessToken } from './verify-auth-token';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { AccessTokenPayload } from '../types/auth';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly config: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: AccessTokenPayload }>();
    const token = request.cookies?.['access_token'] as string | undefined;
    const secret = this.config.get<string>('JWT_ACCESS_SECRET')!;
    const payload = verifyAccessToken<AccessTokenPayload>(token, secret);

    if (payload.type !== 'access') {
      return false;
    }

    request.user = payload;
    return true;
  }
}
