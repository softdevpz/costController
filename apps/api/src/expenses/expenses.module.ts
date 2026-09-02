import { Module } from '@nestjs/common';
import { ProjectsModule } from '../projects/projects.module';
import { StagesModule } from '../stages/stages.module';
import { ExpensesController } from './expenses.controller';
import { ExpensesService } from './expenses.service';

@Module({
  imports: [ProjectsModule, StagesModule],
  controllers: [ExpensesController],
  providers: [ExpensesService],
})
export class ExpensesModule {}
