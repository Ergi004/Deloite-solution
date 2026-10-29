import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AccessTokenPayload } from '../types/auth';

/** Injects the authenticated user's access-token payload into a controller method. */
export const CurrentUser = createParamDecorator(
  (data: keyof AccessTokenPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx
      .switchToHttp()
      .getRequest<{ user: AccessTokenPayload }>();
    return data ? request.user?.[data] : request.user;
  },
);
