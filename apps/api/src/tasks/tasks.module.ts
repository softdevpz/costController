import { Module } from '@nestjs/common';
import { ProjectsModule } from '../projects/projects.module';
import { StagesModule } from '../stages/stages.module';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

@Module({
  imports: [ProjectsModule, StagesModule],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
