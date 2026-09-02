import { Injectable, NotFoundException } from '@nestjs/common';
import { Project } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: string, dto: CreateProjectDto) {
    return this.prisma.project.create({
      data: {
        userId,
        name: dto.name,
        address: dto.address,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        targetBudget: dto.targetBudget,
      },
    });
  }

  findAll(userId: string) {
    return this.prisma.project.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, projectId: string) {
    return this.findOwned(userId, projectId);
  }

  async update(userId: string, projectId: string, dto: UpdateProjectDto) {
    await this.findOwned(userId, projectId);
    return this.prisma.project.update({
      where: { id: projectId },
      data: {
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      },
    });
  }

  async remove(userId: string, projectId: string) {
    await this.findOwned(userId, projectId);
    await this.prisma.project.delete({ where: { id: projectId } });
  }

  async getSummary(userId: string, projectId: string) {
    const project = await this.findOwned(userId, projectId);
    const [stages, expenses] = await Promise.all([
      this.prisma.stage.findMany({ where: { projectId } }),
      this.prisma.expense.findMany({ where: { projectId } }),
    ]);

    const totalSpent = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
    const stageSummaries = stages.map((stage) => ({
      id: stage.id,
      name: stage.name,
      plannedBudget: stage.plannedBudget ? Number(stage.plannedBudget) : null,
      spent: expenses
        .filter((expense) => expense.stageId === stage.id)
        .reduce((sum, expense) => sum + Number(expense.amount), 0),
    }));
    const unassignedSpent = expenses
      .filter((expense) => expense.stageId === null)
      .reduce((sum, expense) => sum + Number(expense.amount), 0);

    return {
      targetBudget: project.targetBudget ? Number(project.targetBudget) : null,
      totalSpent,
      remaining: project.targetBudget ? Number(project.targetBudget) - totalSpent : null,
      stages: stageSummaries,
      unassignedSpent,
    };
  }

  /** Throws 404 for both "doesn't exist" and "not yours" so ownership isn't leaked. */
  async findOwned(userId: string, projectId: string): Promise<Project> {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project || project.userId !== userId) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }
}
