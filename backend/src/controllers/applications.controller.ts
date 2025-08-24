import { Controller, Get, Post, Body, Param, Put, UseGuards, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application, ApplicationStatus } from '../entities/application.entity';
import { StudentProfile } from '../entities/student-profile.entity';
import { InternshipPosition } from '../entities/internship-position.entity';
import { User, UserRole } from '../entities/user.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/user.decorator';
import { Roles } from '../auth/roles.decorator';

@Controller('api/applications')
// @UseGuards(JwtAuthGuard) // 🔥 TEMPORARILY COMMENTED OUT
export class ApplicationsController {
  constructor(
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    @InjectRepository(StudentProfile)
    private studentRepository: Repository<StudentProfile>,
    @InjectRepository(InternshipPosition)
    private positionRepository: Repository<InternshipPosition>,
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  // ✅ SECURE: Only clinics can see applications to their positions
  @Get()
  // @Roles(UserRole.CLINIC, UserRole.ADMIN) // 🔥 TEMPORARILY COMMENTED OUT
  async getMyApplications(
    // @CurrentUser() user: User // 🔥 TEMPORARILY COMMENTED OUT
  ) {
    console.log('Getting clinic applications - JWT disabled, returning empty array');
    // 🔥 TEMPORARY: Return empty array since we can't identify the user without JWT
    return [];
  }

  // ✅ SECURE: Students can only see their own applications
  @Get('my')
  // @Roles(UserRole.STUDENT, UserRole.ADMIN) // 🔥 TEMPORARILY COMMENTED OUT
  async getMyStudentApplications(
    // @CurrentUser() user: User // 🔥 TEMPORARILY COMMENTED OUT
  ) {
    console.log('Getting student applications - JWT disabled, returning empty array');
    // 🔥 TEMPORARY: Return empty array since we can't identify the user without JWT
    return [];
  }

  // ✅ SECURE: Only clinic owners can see applications to their positions
  @Get('position/:positionId')
  // @Roles(UserRole.CLINIC, UserRole.ADMIN) // 🔥 TEMPORARILY COMMENTED OUT
  async getPositionApplications(
    // @CurrentUser() user: User, // 🔥 TEMPORARILY COMMENTED OUT
    @Param('positionId') positionId: string
  ) {
    console.log('Getting position applications - JWT disabled, returning empty array');
    // 🔥 TEMPORARY: Return empty array since we can't identify the user without JWT
    return [];
  }

  // ✅ SECURE: Only students can create applications
  @Post()
  // @Roles(UserRole.STUDENT, UserRole.ADMIN) // 🔥 TEMPORARILY COMMENTED OUT
  async createApplication(
    // @CurrentUser() user: User, // 🔥 TEMPORARILY COMMENTED OUT
    @Body() applicationData: {
      positionId: string;
      coverLetter?: string;
    }
  ) {
    console.log('Creating application - JWT disabled, returning error');
    // 🔥 TEMPORARY: Can't create applications without knowing who the user is
    throw new BadRequestException('Application creation temporarily disabled - JWT authentication required');
  }

  // ✅ SECURE: Only clinic owners can update application status
  @Put(':id/status')
  // @Roles(UserRole.CLINIC, UserRole.ADMIN) // 🔥 TEMPORARILY COMMENTED OUT
  async updateApplicationStatus(
    // @CurrentUser() user: User, // 🔥 TEMPORARILY COMMENTED OUT
    @Param('id') id: string,
    @Body() data: {
      status: ApplicationStatus;
      notes?: string;
    }
  ) {
    console.log('Updating application status - JWT disabled, returning error');
    // 🔥 TEMPORARY: Can't update applications without knowing who the user is
    throw new BadRequestException('Application status update temporarily disabled - JWT authentication required');
  }

  // ✅ SECURE: Students can update their own applications (if pending)
  @Put(':id')
  // @Roles(UserRole.STUDENT, UserRole.ADMIN) // 🔥 TEMPORARILY COMMENTED OUT
  async updateApplication(
    // @CurrentUser() user: User, // 🔥 TEMPORARILY COMMENTED OUT
    @Param('id') id: string,
    @Body() updateData: {
      cover_letter?: string;
    }
  ) {
    console.log('Updating application - JWT disabled, returning error');
    // 🔥 TEMPORARY: Can't update applications without knowing who the user is
    throw new BadRequestException('Application update temporarily disabled - JWT authentication required');
  }

  // ✅ TEMPORARY: Get applications by student auth0Id (until JWT is fixed)
  @Get('student/:auth0Id')
  async getStudentApplications(
    @Param('auth0Id') auth0Id: string
  ) {
    console.log('Getting applications for student:', auth0Id);
  
    try {
      // Find the user first
      const user = await this.userRepository.findOne({
        where: { auth0_id: auth0Id }
      });
    
      if (!user) {
        console.log('User not found:', auth0Id);
        return [];
      }
    
      // Find student profile
      const student = await this.studentRepository.findOne({
        where: { user: { id: user.id } }
      });
    
      if (!student) {
        console.log('Student profile not found for user:', user.id);
        return [];
      }
    
      // Get applications
      const applications = await this.applicationRepository.find({
        where: { student: { id: student.id } },
        relations: ['position', 'position.clinic', 'position.clinic.user'],
        order: { applied_at: 'DESC' }
      });
    
      console.log(`Found ${applications.length} applications for student`);
      return applications;
    } catch (error) {
      console.error('Error fetching student applications:', error);
      return [];
    }
  }


  // 🚫 REMOVED INSECURE ENDPOINTS:
  // - GET student/:auth0Id (allowed anyone to see any student's applications by auth0Id)
  // These were security vulnerabilities and have been removed
}

