import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { CHECK_DEADLINES_JOB, NOTIFICATIONS_QUEUE } from './notifications.constants';

@Injectable()
export class NotificationsService {
  constructor(@InjectQueue(NOTIFICATIONS_QUEUE) private readonly notificationsQueue: Queue) {}

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  scheduleDeadlineCheck() {
    return this.notificationsQueue.add(CHECK_DEADLINES_JOB, {});
  }

  triggerDeadlineCheckNow() {
    return this.notificationsQueue.add(CHECK_DEADLINES_JOB, {});
  }
}
