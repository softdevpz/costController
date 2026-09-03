import { Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { DEADLINE_REMINDER_WINDOW_DAYS, NOTIFICATIONS_QUEUE } from './notifications.constants';

@Processor(NOTIFICATIONS_QUEUE)
export class NotificationsProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationsProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {
    super();
  }

  async process(): Promise<{ notified: number }> {
    const now = new Date();
    const windowEnd = new Date(now.getTime() + DEADLINE_REMINDER_WINDOW_DAYS * 24 * 60 * 60 * 1000);

    const dueTasks = await this.prisma.taskItem.findMany({
      where: {
        done: false,
        remindedAt: null,
        dueDate: { not: null, gte: now, lte: windowEnd },
      },
      include: { project: { include: { user: true } } },
    });

    for (const task of dueTasks) {
      const dueDate = task.dueDate!.toISOString().slice(0, 10);
      await this.mailService.sendMail(
        task.project.user.email,
        `Upcoming deadline: ${task.title}`,
        `Task "${task.title}" in project "${task.project.name}" is due on ${dueDate}.`,
      );
      await this.prisma.taskItem.update({
        where: { id: task.id },
        data: { remindedAt: new Date() },
      });
    }

    this.logger.log(`Deadline check complete: ${dueTasks.length} reminder(s) sent`);
    return { notified: dueTasks.length };
  }
}
