import { IsISO8601, IsNumber, IsOptional, IsPositive, IsString, MinLength } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsISO8601()
  startDate?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  targetBudget?: number;
}
