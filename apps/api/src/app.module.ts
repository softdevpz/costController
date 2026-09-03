import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ProjectsModule } from './projects/projects.module';
import { StagesModule } from './stages/stages.module';
import { ExpensesModule } from './expenses/expenses.module';
import { DocumentsModule } from './documents/documents.module';
import { ReportsModule } from './reports/reports.module';

// Planned modules: BenchmarkModule, NotificationsModule, BillingModule

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST ?? 'localhost',
        port: Number(process.env.REDIS_PORT ?? 6379),
      },
    }),
    PrismaModule,
    AuthModule,
    ProjectsModule,
    StagesModule,
    ExpensesModule,
    DocumentsModule,
    ReportsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
