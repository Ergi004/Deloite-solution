import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import type { SignOptions } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../users/entities/user.entity';
import { RefreshToken } from '../users/entities/refresh-token.entity';
import { StudentProfile } from '../students/entities/student-profile.entity';
import { Invitation } from '../invitations/entities/invitation.entity';
import { UsersService } from '../users/users.service';
import { InvitationsService } from '../invitations/invitations.service';
import { CompaniesService } from '../companies/companies.service';
import { AuditService } from '../audit/audit.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { assertPasswordStrength } from '../helpers/password.helper';
import { hashToken } from '../helpers/token.helper';
import { signToken, verifyAccessToken } from '../guard/verify-auth-token';
import { AccessTokenPayload, RefreshTokenPayload } from '../types/auth';
import { UserRole, UserStatus } from '../types/enums';

const BCRYPT_COST = 12;

export interface IssuedTokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly usersService: UsersService,
    private readonly invitationsService: InvitationsService,
    private readonly companiesService: CompaniesService,
    private readonly auditService: AuditService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto, meta: { userAgent?: string; ip?: string }) {
    if (!dto.consentPrivacy) {
      throw new BadRequestException(
        'You must accept the privacy policy to register',
      );
    }
    assertPasswordStrength(dto.password);

    // Invitations are optional for this build: a token, when provided, still has to be
    // valid and single-use; without one, the student just joins the only seeded company.
    let invitation: Invitation | null = null;
    let companyId: string;
    if (dto.token) {
      invitation = await this.invitationsService.findUsableByRawToken(
        dto.token,
      );
      if (!invitation) {
        throw new BadRequestException(
          'This invitation link is invalid, expired, or already used',
        );
      }
      if (
        invitation.email &&
        invitation.email.toLowerCase() !== dto.email.toLowerCase()
      ) {
        throw new BadRequestException(
          'This invitation was issued for a different email address',
        );
      }
      companyId = invitation.companyId;
    } else {
      const company = await this.companiesService.findTheOnlyCompany();
      companyId = company.id;
    }

    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_COST);

    const { user } = await this.dataSource.transaction(async (manager) => {
      const user = manager.create(User, {
        email: dto.email.toLowerCase(),
        passwordHash,
        role: UserRole.STUDENT,
        companyId,
        status: UserStatus.ACTIVE,
      });
      await manager.save(user);

      const profile = manager.create(StudentProfile, {
        userId: user.id,
        onboardingStep: 1,
      });
      await manager.save(profile);

      if (invitation) {
        await manager.update(
          Invitation,
          { id: invitation.id },
          { usedAt: new Date(), usedByUserId: user.id },
        );
      }

      return { user };
    });

    await this.auditService.log({
      companyId: user.companyId,
      actorId: user.id,
      action: 'USER_REGISTERED',
      entityType: 'User',
      entityId: user.id,
    });

    const tokens = await this.issueTokens(user, meta);
    return { user, tokens };
  }

  async login(dto: LoginDto, meta: { userAgent?: string; ip?: string }) {
    const user = await this.usersService.findByEmailWithPassword(dto.email);
    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const matches = await bcrypt.compare(dto.password, user.passwordHash);
    if (!matches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    await this.usersService.updateLastLogin(user.id);
    await this.auditService.log({
      companyId: user.companyId,
      actorId: user.id,
      action: 'LOGIN',
      entityType: 'User',
      entityId: user.id,
    });

    const tokens = await this.issueTokens(user, meta);
    return { user, tokens };
  }

  async refresh(
    rawRefreshToken: string | undefined,
    meta: { userAgent?: string; ip?: string },
  ) {
    if (!rawRefreshToken) {
      throw new UnauthorizedException('Missing refresh token');
    }
    const secret = this.config.get<string>('JWT_REFRESH_SECRET')!;
    let payload: RefreshTokenPayload;
    try {
      payload = verifyAccessToken<RefreshTokenPayload>(rawRefreshToken, secret);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const stored = await this.refreshTokenRepository.findOne({
      where: { id: payload.tokenId },
    });
    if (!stored || stored.tokenHash !== hashToken(rawRefreshToken)) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (stored.revokedAt) {
      // Reuse of an already-rotated/revoked token: treat as compromised, revoke the whole family.
      await this.refreshTokenRepository.update(
        { userId: stored.userId },
        { revokedAt: new Date() },
      );
      throw new UnauthorizedException(
        'Refresh token reuse detected; all sessions revoked',
      );
    }
    if (stored.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    const user = await this.usersService.findById(stored.userId);
    const tokens = await this.issueTokens(user, meta, stored.id);
    return { user, tokens };
  }

  async logout(rawRefreshToken: string | undefined): Promise<void> {
    if (!rawRefreshToken) return;
    const secret = this.config.get<string>('JWT_REFRESH_SECRET')!;
    try {
      const payload = verifyAccessToken<RefreshTokenPayload>(
        rawRefreshToken,
        secret,
      );
      await this.refreshTokenRepository.update(
        { id: payload.tokenId },
        { revokedAt: new Date() },
      );
    } catch {
      // token already invalid/expired, nothing to revoke
    }
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.usersService.findByIdWithPassword(userId);
    const matches = await bcrypt.compare(
      dto.currentPassword,
      user.passwordHash,
    );
    if (!matches) {
      throw new UnauthorizedException('Current password is incorrect');
    }
    assertPasswordStrength(dto.newPassword);
    const passwordHash = await bcrypt.hash(dto.newPassword, BCRYPT_COST);
    await this.usersService.updatePasswordHash(userId, passwordHash);
    await this.refreshTokenRepository.update(
      { userId },
      { revokedAt: new Date() },
    );
  }

  private async issueTokens(
    user: User,
    meta: { userAgent?: string; ip?: string },
    previousTokenId?: string,
  ): Promise<IssuedTokens> {
    const accessPayload: AccessTokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
      type: 'access',
    };
    const accessToken = signToken(
      accessPayload,
      this.config.get<string>('JWT_ACCESS_SECRET')!,
      {
        expiresIn: this.config.get<string>(
          'JWT_ACCESS_TTL',
        ) as SignOptions['expiresIn'],
      },
    );

    const refreshTtlDays = this.config.get<number>('JWT_REFRESH_TTL_DAYS')!;
    const tokenId = uuidv4();
    const refreshPayload: RefreshTokenPayload = {
      sub: user.id,
      tokenId,
      type: 'refresh',
    };
    const refreshToken = signToken(
      refreshPayload,
      this.config.get<string>('JWT_REFRESH_SECRET')!,
      {
        expiresIn: `${refreshTtlDays}d`,
      },
    );

    const row = this.refreshTokenRepository.create({
      id: tokenId,
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + refreshTtlDays * 24 * 60 * 60 * 1000),
      userAgent: meta.userAgent ?? null,
      ip: meta.ip ?? null,
    });
    await this.refreshTokenRepository.save(row);

    if (previousTokenId) {
      await this.refreshTokenRepository.update(
        { id: previousTokenId },
        { revokedAt: new Date(), replacedByTokenId: tokenId },
      );
    }

    return { accessToken, refreshToken };
  }
}
