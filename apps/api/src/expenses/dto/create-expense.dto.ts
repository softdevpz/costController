import { IsISO8601, IsNumber, IsOptional, IsPositive, IsString, MinLength } from 'class-validator';

export class CreateExpenseDto {
  @IsString()
  @MinLength(1)
  category!: string;

  @IsNumber()
  @IsPositive()
  amount!: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsISO8601()
  date!: string;

  @IsOptional()
  @IsString()
  vendor?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  invoiceFileUrl?: string;

  @IsOptional()
  @IsString()
  stageId?: string;
}
