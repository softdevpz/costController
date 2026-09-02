import { IsIn, IsString, MinLength } from 'class-validator';

export const DOCUMENT_TYPES = ['invoice', 'contract', 'photo'] as const;
export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export class PresignUploadDto {
  @IsString()
  @MinLength(1)
  fileName!: string;

  @IsString()
  @MinLength(1)
  contentType!: string;

  @IsIn(DOCUMENT_TYPES)
  type!: DocumentType;
}
