import { Controller, Get, Post, Body, Param, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from '../entities/document.entity';
import { StudentProfile } from '../entities/student-profile.entity';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import * as path from 'path';

@Controller('api/documents')
export class DocumentsController {
  constructor(
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
    @InjectRepository(StudentProfile)
    private studentRepository: Repository<StudentProfile>,
  ) {}

  @Get('student/:studentId')
  async getStudentDocuments(@Param('studentId') studentId: string) {
    try {
      const documents = await this.documentRepository.find({
        where: { student_id: studentId }
      });
      
      return documents;
    } catch (error) {
      console.error('Error fetching documents:', error);
      return [];
    }
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async uploadDocument(@UploadedFile() file, @Body() body) {
    try {
      const { studentId, documentType, title } = body;
      
      // Ensure uploads directory exists
      if (!fs.existsSync('./uploads')) {
        fs.mkdirSync('./uploads', { recursive: true });
      }
      
      const document = await this.documentRepository.save({
        student_id: studentId,
        title: title,
        type: documentType,
        file_path: file.path,
        file_name: file.originalname,
        uploaded_at: new Date()
      });
      
      return { success: true, document };
    } catch (error) {
      console.error('Error uploading document:', error);
      return { success: false, error: 'Failed to upload document' };
    }
  }
}
