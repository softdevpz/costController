import { IsIn, IsInt, IsNumber, IsOptional, IsPositive, IsString, Min, MinLength } from 'class-validator';

const STAGE_STATUSES = ['pending', 'in_progress', 'done'] as const;

export class CreateStageDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsInt()
  @Min(0)
  order!: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  plannedBudget?: number;

  @IsOptional()
  @IsIn(STAGE_STATUSES)
  status?: (typeof STAGE_STATUSES)[number];
}
