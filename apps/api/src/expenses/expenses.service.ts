import { Injectable, NotFoundException } from '@nestjs/common';
import { Expense } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectsService } from '../projects/projects.service';
import { StagesService } from '../stages/stages.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@Injectable()
export class ExpensesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projectsService: ProjectsService,
    private readonly stagesService: StagesService,
  ) {}

  async create(userId: string, projectId: string, dto: CreateExpenseDto) {
    await this.projectsService.findOwned(userId, projectId);
    if (dto.stageId) {
      await this.stagesService.findOwned(userId, projectId, dto.stageId);
    }
    return this.prisma.expense.create({
      data: {
        projectId,
        stageId: dto.stageId,
        category: dto.category,
        amount: dto.amount,
        currency: dto.currency,
        date: new Date(dto.date),
        vendor: dto.vendor,
        description: dto.description,
        invoiceFileUrl: dto.invoiceFileUrl,
      },
    });
  }

  async findAll(userId: string, projectId: string, stageId?: string) {
    await this.projectsService.findOwned(userId, projectId);
    return this.prisma.expense.findMany({
      where: { projectId, ...(stageId ? { stageId } : {}) },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(userId: string, projectId: string, expenseId: string) {
    return this.findOwned(userId, projectId, expenseId);
  }

  async update(userId: string, projectId: string, expenseId: string, dto: UpdateExpenseDto) {
    await this.findOwned(userId, projectId, expenseId);
    if (dto.stageId) {
      await this.stagesService.findOwned(userId, projectId, dto.stageId);
    }
    return this.prisma.expense.update({
      where: { id: expenseId },
      data: {
        ...dto,
        date: dto.date ? new Date(dto.date) : undefined,
      },
    });
  }

  async remove(userId: string, projectId: string, expenseId: string) {
    await this.findOwned(userId, projectId, expenseId);
    await this.prisma.expense.delete({ where: { id: expenseId } });
  }

  private async findOwned(userId: string, projectId: string, expenseId: string): Promise<Expense> {
    await this.projectsService.findOwned(userId, projectId);
    const expense = await this.prisma.expense.findUnique({ where: { id: expenseId } });
    if (!expense || expense.projectId !== projectId) {
      throw new NotFoundException('Expense not found');
    }
    return expense;
  }
}
