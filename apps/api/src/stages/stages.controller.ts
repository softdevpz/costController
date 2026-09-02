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
import { StagesService } from './stages.service';
import { CreateStageDto } from './dto/create-stage.dto';
import { UpdateStageDto } from './dto/update-stage.dto';

@UseGuards(JwtAuthGuard)
@Controller('projects/:projectId/stages')
export class StagesController {
  constructor(private readonly stagesService: StagesService) {}

  @Post()
  create(
    @CurrentUser() user: JwtPayload,
    @Param('projectId') projectId: string,
    @Body() dto: CreateStageDto,
  ) {
    return this.stagesService.create(user.sub, projectId, dto);
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload, @Param('projectId') projectId: string) {
    return this.stagesService.findAll(user.sub, projectId);
  }

  @Get(':stageId')
  findOne(
    @CurrentUser() user: JwtPayload,
    @Param('projectId') projectId: string,
    @Param('stageId') stageId: string,
  ) {
    return this.stagesService.findOne(user.sub, projectId, stageId);
  }

  @Patch(':stageId')
  update(
    @CurrentUser() user: JwtPayload,
    @Param('projectId') projectId: string,
    @Param('stageId') stageId: string,
    @Body() dto: UpdateStageDto,
  ) {
    return this.stagesService.update(user.sub, projectId, stageId, dto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':stageId')
  remove(
    @CurrentUser() user: JwtPayload,
    @Param('projectId') projectId: string,
    @Param('stageId') stageId: string,
  ) {
    return this.stagesService.remove(user.sub, projectId, stageId);
  }
}
