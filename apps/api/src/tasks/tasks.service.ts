import { Injectable, NotFoundException } from '@nestjs/common';
import { TaskItem } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectsService } from '../projects/projects.service';
import { StagesService } from '../stages/stages.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projectsService: ProjectsService,
    private readonly stagesService: StagesService,
  ) {}

  async create(userId: string, projectId: string, dto: CreateTaskDto) {
    await this.projectsService.findOwned(userId, projectId);
    if (dto.stageId) {
      await this.stagesService.findOwned(userId, projectId, dto.stageId);
    }
    return this.prisma.taskItem.create({
      data: {
        projectId,
        stageId: dto.stageId,
        title: dto.title,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
    });
  }

  async findAll(userId: string, projectId: string) {
    await this.projectsService.findOwned(userId, projectId);
    return this.prisma.taskItem.findMany({
      where: { projectId },
      orderBy: [{ done: 'asc' }, { dueDate: 'asc' }],
    });
  }

  async findOne(userId: string, projectId: string, taskId: string) {
    return this.findOwned(userId, projectId, taskId);
  }

  async update(userId: string, projectId: string, taskId: string, dto: UpdateTaskDto) {
    await this.findOwned(userId, projectId, taskId);
    if (dto.stageId) {
      await this.stagesService.findOwned(userId, projectId, dto.stageId);
    }
    return this.prisma.taskItem.update({
      where: { id: taskId },
      data: {
        ...dto,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
    });
  }

  async remove(userId: string, projectId: string, taskId: string) {
    await this.findOwned(userId, projectId, taskId);
    await this.prisma.taskItem.delete({ where: { id: taskId } });
  }

  private async findOwned(userId: string, projectId: string, taskId: string): Promise<TaskItem> {
    await this.projectsService.findOwned(userId, projectId);
    const task = await this.prisma.taskItem.findUnique({ where: { id: taskId } });
    if (!task || task.projectId !== projectId) {
      throw new NotFoundException('Task not found');
    }
    return task;
  }
}
