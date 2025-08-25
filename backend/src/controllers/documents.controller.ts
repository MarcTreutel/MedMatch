import { Controller, Get, Post, Delete, Body, Param, UploadedFile, UseInterceptors, UseGuards, BadRequestException, NotFoundException, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document, DocumentType } from '../entities/document.entity';
import { UserProfile } from '../entities/user-profile.entity'; // UPDATED: was StudentProfile
import { User, UserRole } from '../entities/user.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/user.decorator';
import { Roles } from '../auth/roles.decorator';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Controller('api/documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
    @InjectRepository(UserProfile) // UPDATED: was StudentProfile
    private userProfileRepository: Repository<UserProfile>, // UPDATED: was studentRepository
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  @Get('my')
  @Roles(UserRole.STUDENT, UserRole.CLINIC_ADMIN, UserRole.ADMIN) // UPDATED: was UserRole.CLINIC
  async getMyDocuments(@CurrentUser() user: User) {
    console.log('Getting documents for user:', user.id);

    try {
      // UPDATED: Get user profile first, then find documents by profile ID
      const userProfile = await this.userProfileRepository.findOne({
        where: { user_id: user.id }
      });

      if (!userProfile) {
        return []; // No profile means no documents
      }

      const documents = await this.documentRepository.find({
        where: { student_id: userProfile.id }, // UPDATED: Use profile ID instead of user ID
        order: { uploaded_at: 'DESC' }
      });

      return documents;
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw new BadRequestException('Failed to fetch documents');
    }
  }

  @Get('application/:applicationId')
  @Roles(UserRole.CLINIC_ADMIN, UserRole.ADMIN) // UPDATED: was UserRole.CLINIC
  async getApplicationDocuments(
    @CurrentUser() user: User,
    @Param('applicationId') applicationId: string
  ) {
    console.log('Getting application documents for user:', user.id, 'applicationId:', applicationId);

    if (user.role !== UserRole.CLINIC_ADMIN && user.role !== UserRole.ADMIN) { // UPDATED: was UserRole.CLINIC
      throw new BadRequestException('Only clinic admins and admins can access application documents');
    }

    try {
      // UPDATED: Use clinic_id from user's clinic relationship
      const application = await this.documentRepository.query(`
        SELECT a.*, p.clinic_id, a.student_id
        FROM applications a
        JOIN internship_positions p ON a.position_id = p.id
        WHERE a.id = $1 AND p.clinic_id = $2
      `, [applicationId, user.clinic_id]); // UPDATED: Use user.clinic_id

      if (!application || application.length === 0) {
        throw new NotFoundException('Application not found or access denied');
      }

      const studentProfileId = application[0].student_id; // This is now a profile ID

      const documents = await this.documentRepository.find({
        where: { student_id: studentProfileId },
        order: { uploaded_at: 'DESC' }
      });

      return documents;
    } catch (error) {
      console.error('Error fetching application documents:', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to fetch application documents');
    }
  }

  @Post('upload')
  @Roles(UserRole.STUDENT, UserRole.CLINIC_ADMIN, UserRole.ADMIN) // UPDATED: was UserRole.CLINIC
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
      fileFilter: (req, file, cb) => {
        const allowedTypes = /\.(pdf|doc|docx|jpg|jpeg|png)$/i;
        if (allowedTypes.test(extname(file.originalname))) {
          return cb(null, true);
        } else {
          return cb(new Error('Only PDF, DOC, DOCX, JPG, JPEG, and PNG files are allowed'), false);
        }
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
    }),
  )
  async uploadDocument(
    @CurrentUser() user: User,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: {
      documentType: DocumentType;
      title?: string; // Made optional since it's not in the entity
    }
  ) {
    console.log('Uploading document for user:', user.id);

    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    try {
      const { documentType } = body;

      // UPDATED: Get user profile first
      const userProfile = await this.userProfileRepository.findOne({
        where: { user_id: user.id }
      });

      if (!userProfile) {
        throw new BadRequestException('User profile not found');
      }

      // Ensure uploads directory exists
      if (!fs.existsSync('./uploads')) {
        fs.mkdirSync('./uploads', { recursive: true });
      }

      // UPDATED: Create document with correct field names matching the new entity
      const document = this.documentRepository.create({
        student_id: userProfile.id,     // UPDATED: Use profile ID
        filename: file.originalname,    // UPDATED: was file_name
        path: file.path,               // UPDATED: was file_path
        type: documentType,
        // uploaded_at is auto-generated by @CreateDateColumn
      });

      const savedDocument = await this.documentRepository.save(document);

      console.log('Document uploaded:', savedDocument.id);
      return { 
        success: true, 
        message: 'Document uploaded successfully',
        document: savedDocument 
      };
    } catch (error) {
      console.error('Error uploading document:', error);
      
      if (file && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      
      throw new BadRequestException('Failed to upload document');
    }
  }

  @Get('download/:documentId')
  @Roles(UserRole.STUDENT, UserRole.CLINIC_ADMIN, UserRole.ADMIN) // UPDATED: was UserRole.CLINIC
  async downloadDocument(
    @CurrentUser() user: User,
    @Param('documentId') documentId: string,
    @Res() res: Response
  ) {
    console.log('Downloading document for user:', user.id, 'documentId:', documentId);

    try {
      const document = await this.documentRepository.findOne({
        where: { id: documentId }
      });

      if (!document) {
        throw new NotFoundException('Document not found');
      }

      // Check access permissions
      let hasAccess = false;

      // UPDATED: Check if document belongs to user's profile
      const userProfile = await this.userProfileRepository.findOne({
        where: { user_id: user.id }
      });

      if (userProfile && document.student_id === userProfile.id) {
        hasAccess = true;
      }
      else if (user.role === UserRole.CLINIC_ADMIN || user.role === UserRole.ADMIN) { // UPDATED: was UserRole.CLINIC
        // UPDATED: Check if clinic admin has access through applications
        const applicationExists = await this.documentRepository.query(`
          SELECT 1
          FROM applications a
          JOIN internship_positions p ON a.position_id = p.id
          WHERE a.student_id = $1 AND p.clinic_id = $2
        `, [document.student_id, user.clinic_id]); // UPDATED: Use user.clinic_id

        if (applicationExists && applicationExists.length > 0) {
          hasAccess = true;
        }
      }

      if (!hasAccess) {
        throw new BadRequestException('Access denied to this document');
      }

      if (!fs.existsSync(document.path)) { // UPDATED: was document.file_path
        throw new NotFoundException('File not found on server');
      }

      const mimeType = this.getMimeTypeFromExtension(document.filename); // UPDATED: was document.file_name
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${document.filename}"`); // UPDATED: was document.file_name

      const fileStream = fs.createReadStream(document.path); // UPDATED: was document.file_path
      fileStream.pipe(res);
    } catch (error) {
      console.error('Error downloading document:', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to download document');
    }
  }

  @Delete(':documentId')
  @Roles(UserRole.STUDENT, UserRole.CLINIC_ADMIN, UserRole.ADMIN) // UPDATED: was UserRole.CLINIC
  async deleteDocument(
    @CurrentUser() user: User,
    @Param('documentId') documentId: string
  ) {
    console.log('Deleting document for user:', user.id, 'documentId:', documentId);

    try {
      // UPDATED: Get user profile first
      const userProfile = await this.userProfileRepository.findOne({
        where: { user_id: user.id }
      });

      if (!userProfile) {
        throw new BadRequestException('User profile not found');
      }

      const document = await this.documentRepository.findOne({
        where: { 
          id: documentId,
          student_id: userProfile.id // UPDATED: Use profile ID
        }
      });

      if (!document) {
        throw new NotFoundException('Document not found or access denied');
      }

      if (fs.existsSync(document.path)) { // UPDATED: was document.file_path
        fs.unlinkSync(document.path); // UPDATED: was document.file_path
      }

      await this.documentRepository.remove(document);

      return { 
        success: true, 
        message: 'Document deleted successfully' 
      };
    } catch (error) {
      console.error('Error deleting document:', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to delete document');
    }
  }

  private getMimeTypeFromExtension(filename: string): string {
    const ext = extname(filename).toLowerCase();
    const mimeTypes: { [key: string]: string } = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }
}
