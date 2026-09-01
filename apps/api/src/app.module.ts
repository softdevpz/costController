import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';

// Docelowe moduły (Faza 1+): AuthModule, ProjectsModule, StagesModule,
// ExpensesModule, DocumentsModule, ReportsModule, BenchmarkModule,
// NotificationsModule, BillingModule

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
  ],
  controllers: [AppController],
})
export class AppModule {}
