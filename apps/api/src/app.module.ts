import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ProjectsModule } from './projects/projects.module';
import { StagesModule } from './stages/stages.module';
import { ExpensesModule } from './expenses/expenses.module';

// Planned modules: DocumentsModule, ReportsModule, BenchmarkModule,
// NotificationsModule, BillingModule

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    ProjectsModule,
    StagesModule,
    ExpensesModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
