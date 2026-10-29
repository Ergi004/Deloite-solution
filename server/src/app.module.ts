import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { LoggerModule } from 'nestjs-pino';
import { APP_GUARD } from '@nestjs/core';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { validateEnv } from './config/env.schema';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { RolesGuard } from './guard/roles.guard';

import { CompaniesModule } from './companies/companies.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { InvitationsModule } from './invitations/invitations.module';
import { SkillsModule } from './skills/skills.module';
import { OnboardingModule } from './onboarding/onboarding.module';
import { CoursesModule } from './courses/courses.module';
import { JobsModule } from './jobs/jobs.module';
import { StudentsModule } from './students/students.module';
import { CareerPathModule } from './career-path/career-path.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AuditModule } from './audit/audit.module';
import { TalentsModule } from './talents/talents.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    LoggerModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        pinoHttp: {
          level:
            config.get<string>('NODE_ENV') === 'production' ? 'info' : 'debug',
          redact: {
            paths: [
              'req.headers.cookie',
              'req.headers.authorization',
              'req.body.password',
              'req.body.confirmPassword',
              'req.body.currentPassword',
              'req.body.newPassword',
              'res.headers["set-cookie"]',
              '*.passwordHash',
              '*.tokenHash',
              '*.apiKey',
              '*.GEMINI_API_KEY',
            ],
            censor: '[redacted]',
          },
          transport:
            config.get<string>('NODE_ENV') === 'production'
              ? undefined
              : { target: 'pino-pretty', options: { singleLine: true } },
        },
      }),
      inject: [ConfigService],
      imports: [ConfigModule],
    }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        charset: 'utf8mb4_unicode_ci',
        namingStrategy: new SnakeNamingStrategy(),
        autoLoadEntities: true,
        synchronize: false,
      }),
    }),
    CompaniesModule,
    UsersModule,
    AuthModule,
    InvitationsModule,
    SkillsModule,
    OnboardingModule,
    CoursesModule,
    JobsModule,
    StudentsModule,
    CareerPathModule,
    DashboardModule,
    AuditModule,
    TalentsModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
