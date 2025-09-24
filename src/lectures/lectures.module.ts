import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { LecturesService } from './lectures.service';
import { LecturesController } from './lectures.controller';
import { FileProcessingModule } from '../file-processing/file-processing.module';

@Module({
  imports: [
    FileProcessingModule,
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads/temp', // Temporary storage before processing
        filename: (req, file, cb) => {
          const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      limits: {
        fileSize: 104857600, // 100MB
      },
      fileFilter: (req, file, cb) => {
        const allowedTypes = /pdf|ppt|pptx|doc|docx|txt/;
        const extName = allowedTypes.test(extname(file.originalname).toLowerCase());
        const mimeType = allowedTypes.test(file.mimetype);
        
        if (extName && mimeType) {
          cb(null, true);
        } else {
          cb(new Error('Only PDF, PowerPoint, Word, and text files are allowed!'), false);
        }
      },
    }),
  ],
  controllers: [LecturesController],
  providers: [LecturesService],
  exports: [LecturesService],
})
export class LecturesModule {}