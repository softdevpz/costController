import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/types/jwt-payload.type';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@UseGuards(JwtAuthGuard)
@Controller('projects/:projectId/tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(
    @CurrentUser() user: JwtPayload,
    @Param('projectId') projectId: string,
    @Body() dto: CreateTaskDto,
  ) {
    return this.tasksService.create(user.sub, projectId, dto);
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload, @Param('projectId') projectId: string) {
    return this.tasksService.findAll(user.sub, projectId);
  }

  @Get(':taskId')
  findOne(
    @CurrentUser() user: JwtPayload,
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
  ) {
    return this.tasksService.findOne(user.sub, projectId, taskId);
  }

  @Patch(':taskId')
  update(
    @CurrentUser() user: JwtPayload,
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasksService.update(user.sub, projectId, taskId, dto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':taskId')
  remove(
    @CurrentUser() user: JwtPayload,
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
  ) {
    return this.tasksService.remove(user.sub, projectId, taskId);
  }
}
