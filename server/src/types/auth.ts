import { UserRole } from './enums';

export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: UserRole;
  companyId: string | null;
  type: 'access';
}

export interface RefreshTokenPayload {
  sub: string;
  tokenId: string;
  type: 'refresh';
}

export type AuthenticatedRequest = Request & { user: AccessTokenPayload };
