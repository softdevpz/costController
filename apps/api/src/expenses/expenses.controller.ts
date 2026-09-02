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
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/types/jwt-payload.type';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@UseGuards(JwtAuthGuard)
@Controller('projects/:projectId/expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  create(
    @CurrentUser() user: JwtPayload,
    @Param('projectId') projectId: string,
    @Body() dto: CreateExpenseDto,
  ) {
    return this.expensesService.create(user.sub, projectId, dto);
  }

  @Get()
  findAll(
    @CurrentUser() user: JwtPayload,
    @Param('projectId') projectId: string,
    @Query('stageId') stageId?: string,
  ) {
    return this.expensesService.findAll(user.sub, projectId, stageId);
  }

  @Get(':expenseId')
  findOne(
    @CurrentUser() user: JwtPayload,
    @Param('projectId') projectId: string,
    @Param('expenseId') expenseId: string,
  ) {
    return this.expensesService.findOne(user.sub, projectId, expenseId);
  }

  @Patch(':expenseId')
  update(
    @CurrentUser() user: JwtPayload,
    @Param('projectId') projectId: string,
    @Param('expenseId') expenseId: string,
    @Body() dto: UpdateExpenseDto,
  ) {
    return this.expensesService.update(user.sub, projectId, expenseId, dto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':expenseId')
  remove(
    @CurrentUser() user: JwtPayload,
    @Param('projectId') projectId: string,
    @Param('expenseId') expenseId: string,
  ) {
    return this.expensesService.remove(user.sub, projectId, expenseId);
  }
}
