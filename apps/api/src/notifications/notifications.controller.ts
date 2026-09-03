import { Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // Lets us trigger the daily deadline check on demand instead of waiting for the cron.
  @HttpCode(HttpStatus.ACCEPTED)
  @Post('check-deadlines-now')
  triggerNow() {
    return this.notificationsService.triggerDeadlineCheckNow();
  }
}
