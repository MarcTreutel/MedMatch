import { Controller, Get, Post, Body, Param, Put, UseGuards, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application, ApplicationStatus } from '../entities/application.entity';
import { UserProfile } from '../entities/user-profile.entity'; // UPDATED: was StudentProfile
import { InternshipPosition } from '../entities/internship-position.entity';
import { User, UserRole } from '../entities/user.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/user.decorator';
import { Roles } from '../auth/roles.decorator';

@Controller('api/applications')
@UseGuards(JwtAuthGuard) // UPDATED: Re-enabled JWT guard
export class ApplicationsController {
  constructor(
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    @InjectRepository(UserProfile) // UPDATED: was StudentProfile
    private userProfileRepository: Repository<UserProfile>, // UPDATED: was studentRepository
    @InjectRepository(InternshipPosition)
    private positionRepository: Repository<InternshipPosition>,
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  // SECURE: Only clinic admins can see applications to their positions
  @Get()
  @Roles(UserRole.CLINIC_ADMIN, UserRole.ADMIN) // UPDATED: was UserRole.CLINIC
  async getMyApplications(
    @CurrentUser() user: User
  ) {
    console.log('Getting clinic applications for user:', user.id);

    try {
      if (!user.clinic_id) {
        throw new BadRequestException('User is not associated with a clinic');
      }

      // Get all applications for positions belonging to this clinic
      const applications = await this.applicationRepository.find({
        where: { 
          position: { 
            clinic_id: user.clinic_id // UPDATED: Use clinic_id from user
          } 
        },
        relations: ['position', 'student', 'student.user'], // UPDATED: Include user profile relationships
        order: { applied_at: 'DESC' }
      });

      console.log(`Found ${applications.length} applications for clinic`);
      return applications;
    } catch (error) {
      console.error('Error fetching clinic applications:', error);
      throw new BadRequestException('Failed to fetch applications');
    }
  }

  // SECURE: Students can only see their own applications
  @Get('my')
  @Roles(UserRole.STUDENT, UserRole.ADMIN)
  async getMyStudentApplications(
    @CurrentUser() user: User
  ) {
    console.log('Getting student applications for user:', user.id);

    try {
      // Get user profile first
      const userProfile = await this.userProfileRepository.findOne({
        where: { user_id: user.id }
      });

      if (!userProfile) {
        console.log('User profile not found for user:', user.id);
        return [];
      }

      // Get applications using profile ID
      const applications = await this.applicationRepository.find({
        where: { student_id: userProfile.id }, // UPDATED: Use student_id field
        relations: ['position', 'position.clinic'], // UPDATED: Include clinic relationship
        order: { applied_at: 'DESC' }
      });

      console.log(`Found ${applications.length} applications for student`);
      return applications;
    } catch (error) {
      console.error('Error fetching student applications:', error);
      throw new BadRequestException('Failed to fetch applications');
    }
  }

  // SECURE: Only clinic owners can see applications to their positions
  @Get('position/:positionId')
  @Roles(UserRole.CLINIC_ADMIN, UserRole.ADMIN) // UPDATED: was UserRole.CLINIC
  async getPositionApplications(
    @CurrentUser() user: User,
    @Param('positionId') positionId: string
  ) {
    console.log('Getting position applications for user:', user.id, 'position:', positionId);

    try {
      // Verify the position belongs to the user's clinic
      const position = await this.positionRepository.findOne({
        where: { 
          id: positionId,
          clinic_id: user.clinic_id // UPDATED: Use clinic_id from user
        }
      });

      if (!position) {
        throw new NotFoundException('Position not found or access denied');
      }

      const applications = await this.applicationRepository.find({
        where: { position_id: positionId }, // UPDATED: Use position_id field
        relations: ['student', 'student.user'], // UPDATED: Include user profile relationships
        order: { applied_at: 'DESC' }
      });

      console.log(`Found ${applications.length} applications for position`);
      return applications;
    } catch (error) {
      console.error('Error fetching position applications:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to fetch position applications');
    }
  }

  // SECURE: Only students can create applications
  @Post()
  @Roles(UserRole.STUDENT, UserRole.ADMIN)
  async createApplication(
    @CurrentUser() user: User,
    @Body() applicationData: {
      positionId: string;
      coverLetter?: string;
    }
  ) {
    console.log('Creating application for user:', user.id);

    try {
      const { positionId, coverLetter } = applicationData;

      // Get user profile
      const userProfile = await this.userProfileRepository.findOne({
        where: { user_id: user.id }
      });

      if (!userProfile) {
        throw new BadRequestException('User profile not found');
      }

      // Verify position exists
      const position = await this.positionRepository.findOne({
        where: { id: positionId }
      });

      if (!position) {
        throw new NotFoundException('Position not found');
      }

      // Check if application already exists
      const existingApplication = await this.applicationRepository.findOne({
        where: { 
          student_id: userProfile.id, // UPDATED: Use profile ID
          position_id: positionId // UPDATED: Use position_id field
        }
      });

      if (existingApplication) {
        throw new BadRequestException('Application already exists for this position');
      }

      // Create application
      const application = this.applicationRepository.create({
        student_id: userProfile.id, // UPDATED: Use profile ID
        position_id: positionId, // UPDATED: Use position_id field
        cover_letter: coverLetter,
        status: ApplicationStatus.PENDING
      });

      const savedApplication = await this.applicationRepository.save(application);

      console.log('Application created:', savedApplication.id);
      return savedApplication;
    } catch (error) {
      console.error('Error creating application:', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create application');
    }
  }

  // SECURE: Only clinic owners can update application status
  @Put(':id/status')
  @Roles(UserRole.CLINIC_ADMIN, UserRole.ADMIN) // UPDATED: was UserRole.CLINIC
  async updateApplicationStatus(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() data: {
      status: ApplicationStatus;
      notes?: string;
    }
  ) {
    console.log('Updating application status for user:', user.id, 'application:', id);

    try {
      // Find application and verify clinic ownership
      const application = await this.applicationRepository.findOne({
        where: { id },
        relations: ['position']
      });

      if (!application) {
        throw new NotFoundException('Application not found');
      }

      // Verify the position belongs to the user's clinic
      if (application.position.clinic_id !== user.clinic_id) { // UPDATED: Use clinic_id
        throw new BadRequestException('Access denied - position does not belong to your clinic');
      }

      // Update application
      application.status = data.status;
      if (data.notes) {
        application.notes = data.notes;
      }

      const updatedApplication = await this.applicationRepository.save(application);

      console.log('Application status updated:', updatedApplication.id);
      return updatedApplication;
    } catch (error) {
      console.error('Error updating application status:', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to update application status');
    }
  }

  // SECURE: Students can update their own applications (if pending)
  @Put(':id')
  @Roles(UserRole.STUDENT, UserRole.ADMIN)
  async updateApplication(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() updateData: {
      cover_letter?: string;
    }
  ) {
    console.log('Updating application for user:', user.id, 'application:', id);

    try {
      // Get user profile
      const userProfile = await this.userProfileRepository.findOne({
        where: { user_id: user.id }
      });

      if (!userProfile) {
        throw new BadRequestException('User profile not found');
      }

      // Find application and verify ownership
      const application = await this.applicationRepository.findOne({
        where: { 
          id,
          student_id: userProfile.id // UPDATED: Use profile ID
        }
      });

      if (!application) {
        throw new NotFoundException('Application not found or access denied');
      }

      // Only allow updates if application is still pending
      if (application.status !== ApplicationStatus.PENDING) {
        throw new BadRequestException('Cannot update application - status is no longer pending');
      }

      // Update application
      if (updateData.cover_letter !== undefined) {
        application.cover_letter = updateData.cover_letter;
      }

      const updatedApplication = await this.applicationRepository.save(application);

      console.log('Application updated:', updatedApplication.id);
      return updatedApplication;
    } catch (error) {
      console.error('Error updating application:', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to update application');
    }
  }

  // TEMPORARY: Get applications by student auth0Id (for debugging)
  @Get('student/:auth0Id')
  @Roles(UserRole.ADMIN) // UPDATED: Only admins can use this debug endpoint
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

      // Find user profile
      const userProfile = await this.userProfileRepository.findOne({
        where: { user_id: user.id }
      });

      if (!userProfile) {
        console.log('User profile not found for user:', user.id);
        return [];
      }

      // Get applications
      const applications = await this.applicationRepository.find({
        where: { student_id: userProfile.id }, // UPDATED: Use profile ID
        relations: ['position', 'position.clinic'], // UPDATED: Include clinic relationship
        order: { applied_at: 'DESC' }
      });

      console.log(`Found ${applications.length} applications for student`);
      return applications;
    } catch (error) {
      console.error('Error fetching student applications:', error);
      return [];
    }
  }
}
