import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { CareerPathService } from './career-path.service';
import { FeedbackDto } from './dto/feedback.dto';
import { CurrentUser } from '../decorators/current-user.decorator';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from '../types/enums';

@Roles(UserRole.STUDENT)
@Controller('career-path')
export class CareerPathController {
  constructor(private readonly careerPathService: CareerPathService) {}

  @Throttle({ default: { limit: 5, ttl: 3_600_000 } })
  @Post('generate')
  generate(@CurrentUser('sub') userId: string) {
    return this.careerPathService.requestGeneration(userId);
  }

  @Get('latest')
  async latest(@CurrentUser('sub') userId: string) {
    const row = await this.careerPathService.getLatest(userId);
    if (!row)
      throw new NotFoundException('No career path has been generated yet');
    return row;
  }

  @Get(':id/status')
  status(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this.careerPathService.getStatus(id, userId);
  }

  @Post(':id/feedback')
  feedback(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: FeedbackDto,
  ) {
    return this.careerPathService.setFeedback(id, userId, dto);
  }
}
