import PDFDocument = require('pdfkit');
import { Expense, Project, Stage } from '@prisma/client';

export type ReportData = {
  project: Project;
  stages: Stage[];
  expenses: Expense[];
};

function formatCurrency(amount: number, currency: string): string {
  return `${amount.toFixed(2)} ${currency}`;
}

export function buildReportPdf(data: ReportData): Promise<Buffer> {
  const { project, stages, expenses } = data;

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const targetBudget = project.targetBudget ? Number(project.targetBudget) : null;
    const totalSpent = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);

    doc.fontSize(20).text('Construction Budget Report', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`Project: ${project.name}`);
    if (project.address) doc.text(`Address: ${project.address}`);
    if (project.startDate) doc.text(`Start date: ${project.startDate.toISOString().slice(0, 10)}`);
    doc.text(`Status: ${project.status}`);
    doc.text(`Generated: ${new Date().toISOString().slice(0, 10)}`);
    doc.moveDown();

    doc.fontSize(14).text('Budget summary');
    doc.fontSize(12);
    doc.text(`Target budget: ${targetBudget !== null ? formatCurrency(targetBudget, 'PLN') : 'not set'}`);
    doc.text(`Total spent: ${formatCurrency(totalSpent, 'PLN')}`);
    if (targetBudget !== null) {
      doc.text(`Remaining: ${formatCurrency(targetBudget - totalSpent, 'PLN')}`);
    }
    doc.moveDown();

    doc.fontSize(14).text('Stages');
    doc.fontSize(12);
    if (stages.length === 0) {
      doc.text('No stages defined.');
    }
    for (const stage of stages) {
      const stageSpent = expenses
        .filter((expense) => expense.stageId === stage.id)
        .reduce((sum, expense) => sum + Number(expense.amount), 0);
      const planned = stage.plannedBudget ? formatCurrency(Number(stage.plannedBudget), 'PLN') : 'not set';
      doc.text(`- ${stage.name} (${stage.status}) — planned: ${planned}, spent: ${formatCurrency(stageSpent, 'PLN')}`);
    }
    doc.moveDown();

    doc.fontSize(14).text('Expenses');
    doc.fontSize(10);
    if (expenses.length === 0) {
      doc.text('No expenses recorded.');
    }
    for (const expense of expenses) {
      const date = expense.date.toISOString().slice(0, 10);
      const vendor = expense.vendor ? ` — ${expense.vendor}` : '';
      doc.text(
        `${date}  ${expense.category}${vendor}  ${formatCurrency(Number(expense.amount), expense.currency)}`,
      );
    }

    doc.end();
  });
}
