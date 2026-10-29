import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { hashToken } from '../helpers/token.helper';
import { signToken } from '../guard/verify-auth-token';
import { RefreshToken } from '../users/entities/refresh-token.entity';
import { UserRole, UserStatus } from '../types/enums';

const REFRESH_SECRET = 'test-refresh-secret-that-is-long-enough';
const ACCESS_SECRET = 'test-access-secret-that-is-long-enough';

function makeConfig() {
  return {
    get: (key: string) => {
      const values: Record<string, unknown> = {
        JWT_ACCESS_SECRET: ACCESS_SECRET,
        JWT_REFRESH_SECRET: REFRESH_SECRET,
        JWT_ACCESS_TTL: '15m',
        JWT_REFRESH_TTL_DAYS: 14,
      };
      return values[key];
    },
  };
}

function makeRefreshTokenRow(overrides: Partial<RefreshToken>): RefreshToken {
  return {
    id: 'token-1',
    userId: 'user-1',
    tokenHash: '',
    expiresAt: new Date(Date.now() + 1_000_000),
    revokedAt: null,
    replacedByTokenId: null,
    userAgent: null,
    ip: null,
    createdAt: new Date(),
    ...overrides,
  } as RefreshToken;
}

function makeAuthService(refreshTokenRow: RefreshToken | null) {
  const refreshTokenRepository = {
    findOne: jest.fn().mockResolvedValue(refreshTokenRow),
    update: jest.fn().mockResolvedValue(undefined),
    create: jest.fn().mockImplementation((v) => v),
    save: jest.fn().mockImplementation((v) => Promise.resolve(v)),
  };
  const usersService = {
    findById: jest.fn().mockResolvedValue({
      id: 'user-1',
      email: 'student@example.com',
      role: UserRole.STUDENT,
      companyId: 'company-1',
      status: UserStatus.ACTIVE,
    }),
  };
  const service = new AuthService(
    {} as never,
    refreshTokenRepository as never,
    usersService as never,
    {} as never,
    {} as never,
    { log: jest.fn() } as never,
    makeConfig() as never,
  );
  return { service, refreshTokenRepository };
}

describe('AuthService.refresh', () => {
  it('rejects a refresh token whose signature does not match any stored hash', async () => {
    const rawRefreshToken = signToken(
      { sub: 'user-1', tokenId: 'token-1', type: 'refresh' },
      REFRESH_SECRET,
      {
        expiresIn: '14d',
      },
    );
    const { service } = makeAuthService(
      makeRefreshTokenRow({
        tokenHash: hashToken('a-completely-different-token'),
      }),
    );
    await expect(service.refresh(rawRefreshToken, {})).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('rotates the token on a valid, unrevoked refresh', async () => {
    const rawRefreshToken = signToken(
      { sub: 'user-1', tokenId: 'token-1', type: 'refresh' },
      REFRESH_SECRET,
      {
        expiresIn: '14d',
      },
    );
    const { service, refreshTokenRepository } = makeAuthService(
      makeRefreshTokenRow({ tokenHash: hashToken(rawRefreshToken) }),
    );
    const result = await service.refresh(rawRefreshToken, {});
    expect(result.tokens.refreshToken).toBeDefined();
    // the old token row should be marked revoked and linked to its replacement
    expect(refreshTokenRepository.update).toHaveBeenCalledWith(
      { id: 'token-1' },
      expect.objectContaining({
        revokedAt: expect.any(Date),
        replacedByTokenId: expect.any(String),
      }),
    );
  });

  it('detects reuse of an already-revoked token and revokes the whole family', async () => {
    const rawRefreshToken = signToken(
      { sub: 'user-1', tokenId: 'token-1', type: 'refresh' },
      REFRESH_SECRET,
      {
        expiresIn: '14d',
      },
    );
    const { service, refreshTokenRepository } = makeAuthService(
      makeRefreshTokenRow({
        tokenHash: hashToken(rawRefreshToken),
        revokedAt: new Date(),
      }),
    );
    await expect(service.refresh(rawRefreshToken, {})).rejects.toThrow(
      UnauthorizedException,
    );
    expect(refreshTokenRepository.update).toHaveBeenCalledWith(
      { userId: 'user-1' },
      expect.objectContaining({ revokedAt: expect.any(Date) }),
    );
  });

  it('rejects an expired refresh token', async () => {
    const rawRefreshToken = signToken(
      { sub: 'user-1', tokenId: 'token-1', type: 'refresh' },
      REFRESH_SECRET,
      {
        expiresIn: '14d',
      },
    );
    const { service } = makeAuthService(
      makeRefreshTokenRow({
        tokenHash: hashToken(rawRefreshToken),
        expiresAt: new Date(Date.now() - 1000),
      }),
    );
    await expect(service.refresh(rawRefreshToken, {})).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
