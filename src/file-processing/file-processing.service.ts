import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs-extra';
import * as path from 'path';
import sharp from 'sharp';
import pdfParse from 'pdf-parse';
import { v4 as uuid } from 'uuid';

export interface ProcessedFile {
  fileName: string;
  filePath: string;
  fileType: string;
  thumbnailPath?: string | null;
  textContent?: string | null;
}

@Injectable()
export class FileProcessingService {
  private readonly uploadPath: string;
  private readonly allowedTypes: string[];
  private readonly maxFileSize: number;

  constructor(private configService: ConfigService) {
    this.uploadPath = this.configService.get('FILE_STORAGE_PATH', './uploads');
    this.allowedTypes = this.configService.get('ALLOWED_FILE_TYPES', 'pdf,ppt,pptx,doc,docx,txt').split(',');
    this.maxFileSize = this.configService.get('MAX_FILE_SIZE', 52428800); // 50MB
  }

  async processLectureFile(file: Express.Multer.File): Promise<ProcessedFile> {
    // Validate file
    this.validateFile(file);

    // Generate unique filename
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const uniqueFileName = `${uuid()}${fileExtension}`;
    const lecturesDir = path.join(this.uploadPath, 'lectures');
    
    // Ensure directories exist
    await fs.ensureDir(lecturesDir);
    await fs.ensureDir(path.join(this.uploadPath, 'thumbnails'));

    const filePath = path.join(lecturesDir, uniqueFileName);

    // Save file
    await fs.writeFile(filePath, file.buffer);

    const result: ProcessedFile = {
      fileName: uniqueFileName,
      filePath,
      fileType: this.getFileType(fileExtension),
    };

    try {
      // Generate thumbnail for PDFs
      if (fileExtension === '.pdf') {
      result.thumbnailPath = await this.generatePdfThumbnail(filePath, uniqueFileName);
      result.textContent = await this.extractTextFromPdf(filePath);
      }

      // Extract text from other document types
      if (['.txt'].includes(fileExtension)) {
        result.textContent = await this.extractTextFromFile(filePath, fileExtension);
      }
    } catch (error) {
      console.error('Error processing file:', error);
      // Continue even if processing fails
    }

    return result;
  }

  private validateFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (file.size > this.maxFileSize) {
      throw new BadRequestException(`File too large. Maximum size: ${this.maxFileSize / 1024 / 1024}MB`);
    }

    const fileExtension = path.extname(file.originalname).toLowerCase().substring(1);
    if (!this.allowedTypes.includes(fileExtension)) {
      throw new BadRequestException(`File type not allowed. Allowed types: ${this.allowedTypes.join(', ')}`);
    }
  }

  private getFileType(extension: string): string {
    const typeMap = {
      '.pdf': 'pdf',
      '.ppt': 'powerpoint',
      '.pptx': 'powerpoint',
      '.doc': 'word',
      '.docx': 'word',
      '.txt': 'text',
    };
    return typeMap[extension] || 'unknown';
  }

  private async generatePdfThumbnail(filePath: string, fileName: string): Promise<string | null> {
    try {
      // For now, return a placeholder thumbnail path
      // In a full implementation, you'd use a library like pdf2pic
      const thumbnailName = fileName.replace('.pdf', '.jpg');
      const thumbnailPath = path.join(this.uploadPath, 'thumbnails', thumbnailName);
      
      // Create a simple placeholder thumbnail
      await sharp({
        create: {
          width: 200,
          height: 280,
          channels: 4,
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        }
      })
      .png()
      .toFile(thumbnailPath);

      return thumbnailPath;
    } catch (error) {
      console.error('Error generating PDF thumbnail:', error);
      return null;
    }
  }

  private async extractTextFromPdf(filePath: string): Promise<string | null> {
    try {
      const dataBuffer = await fs.readFile(filePath);
      const data = await pdfParse(dataBuffer);
      return data.text;
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      return null;
    }
  }

  private async extractTextFromFile(filePath: string, extension: string): Promise<string | null> {
    try {
      if (extension === '.txt') {
        return await fs.readFile(filePath, 'utf8');
      }
      // Add more file type handlers as needed
      return null;
    } catch (error) {
      console.error('Error extracting text from file:', error);
      return null;
    }
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.remove(filePath);
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }

  getFileUrl(filePath: string): string {
    // Return relative URL for serving files
    const relativePath = path.relative(this.uploadPath, filePath);
    return `/uploads/${relativePath.replace(/\\/g, '/')}`;
  }
}