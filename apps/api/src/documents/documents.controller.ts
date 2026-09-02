import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/types/jwt-payload.type';
import { DocumentsService } from './documents.service';
import { PresignUploadDto } from './dto/presign-upload.dto';
import { ConfirmUploadDto } from './dto/confirm-upload.dto';

@UseGuards(JwtAuthGuard)
@Controller('projects/:projectId/documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('presign')
  presignUpload(
    @CurrentUser() user: JwtPayload,
    @Param('projectId') projectId: string,
    @Body() dto: PresignUploadDto,
  ) {
    return this.documentsService.presignUpload(user.sub, projectId, dto);
  }

  @Post()
  confirmUpload(
    @CurrentUser() user: JwtPayload,
    @Param('projectId') projectId: string,
    @Body() dto: ConfirmUploadDto,
  ) {
    return this.documentsService.confirmUpload(user.sub, projectId, dto);
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload, @Param('projectId') projectId: string) {
    return this.documentsService.findAll(user.sub, projectId);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':documentId')
  remove(
    @CurrentUser() user: JwtPayload,
    @Param('projectId') projectId: string,
    @Param('documentId') documentId: string,
  ) {
    return this.documentsService.remove(user.sub, projectId, documentId);
  }
}
