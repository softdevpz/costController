import { Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../storage/s3.service';
import { buildReportPdf } from './report-pdf.builder';
import { REPORTS_QUEUE, ReportJobData } from './reports.constants';

@Processor(REPORTS_QUEUE)
export class ReportsProcessor extends WorkerHost {
  private readonly logger = new Logger(ReportsProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
  ) {
    super();
  }

  async process(job: Job<ReportJobData>): Promise<void> {
    const { reportId, projectId } = job.data;

    try {
      const [project, stages, expenses] = await Promise.all([
        this.prisma.project.findUniqueOrThrow({ where: { id: projectId } }),
        this.prisma.stage.findMany({ where: { projectId }, orderBy: { order: 'asc' } }),
        this.prisma.expense.findMany({ where: { projectId }, orderBy: { date: 'asc' } }),
      ]);

      const pdfBuffer = await buildReportPdf({ project, stages, expenses });
      const key = `reports/${projectId}/${reportId}.pdf`;
      await this.s3Service.uploadBuffer(key, pdfBuffer, 'application/pdf');

      await this.prisma.report.update({
        where: { id: reportId },
        data: { status: 'completed', fileUrl: key, completedAt: new Date() },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Report ${reportId} generation failed: ${message}`);
      await this.prisma.report.update({
        where: { id: reportId },
        data: { status: 'failed', error: message, completedAt: new Date() },
      });
      throw error;
    }
  }
}
