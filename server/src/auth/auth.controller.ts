import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Public } from '../decorators/public.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { UsersService } from '../users/users.service';
import {
  setAuthCookies,
  clearAuthCookies,
  REFRESH_COOKIE,
} from '../helpers/cookie.helper';

function meta(req: Request) {
  return { userAgent: req.headers['user-agent'], ip: req.ip };
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly config: ConfigService,
  ) {}

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, tokens } = await this.authService.register(dto, meta(req));
    setAuthCookies(
      res,
      tokens,
      this.config.get<number>('JWT_REFRESH_TTL_DAYS')!,
    );
    return this.toPublicUser(user);
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, tokens } = await this.authService.login(dto, meta(req));
    setAuthCookies(
      res,
      tokens,
      this.config.get<number>('JWT_REFRESH_TTL_DAYS')!,
    );
    return this.toPublicUser(user);
  }

  @Public()
  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const raw = req.cookies?.[REFRESH_COOKIE] as string | undefined;
    const { user, tokens } = await this.authService.refresh(raw, meta(req));
    setAuthCookies(
      res,
      tokens,
      this.config.get<number>('JWT_REFRESH_TTL_DAYS')!,
    );
    return this.toPublicUser(user);
  }

  @Public()
  @HttpCode(204)
  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const raw = req.cookies?.[REFRESH_COOKIE] as string | undefined;
    await this.authService.logout(raw);
    clearAuthCookies(res);
  }

  @Get('me')
  async me(@CurrentUser('sub') userId: string) {
    const user = await this.usersService.findById(userId);
    return this.toPublicUser(user);
  }

  @HttpCode(204)
  @Post('change-password')
  async changePassword(
    @CurrentUser('sub') userId: string,
    @Body() dto: ChangePasswordDto,
  ) {
    await this.authService.changePassword(userId, dto);
  }

  private toPublicUser(user: {
    id: string;
    email: string;
    role: string;
    companyId: string | null;
    status: string;
  }) {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
      status: user.status,
    };
  }
}
