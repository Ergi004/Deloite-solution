import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { CompleteOnboardingDto } from './dto/complete-onboarding.dto';
import { CurrentUser } from '../decorators/current-user.decorator';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from '../types/enums';

@Roles(UserRole.STUDENT)
@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Get()
  getState(@CurrentUser('sub') userId: string) {
    return this.onboardingService.getState(userId);
  }

  @Put('steps/:step')
  saveStep(
    @CurrentUser('sub') userId: string,
    @Param('step', ParseIntPipe) step: number,
    @Body() body: unknown,
  ) {
    return this.onboardingService.saveStep(userId, step, body);
  }

  @Post('complete')
  complete(
    @CurrentUser('sub') userId: string,
    @Body() dto: CompleteOnboardingDto,
  ) {
    return this.onboardingService.complete(userId, dto);
  }
}
