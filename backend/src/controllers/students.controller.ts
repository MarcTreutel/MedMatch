import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';
import { Application, ApplicationStatus } from '../entities/application.entity';
import { UserProfile } from '../entities/user-profile.entity'; // UPDATED: was StudentProfile
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/user.decorator';

@Controller('api/students')
@UseGuards(JwtAuthGuard) // Protect all routes in this controller
export class StudentsController {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    @InjectRepository(UserProfile) // UPDATED: was StudentProfile
    private userProfileRepository: Repository<UserProfile>, // UPDATED: was studentProfileRepository
  ) {}

  // SECURE: User gets their own profile from JWT token
  @Get('profile')
  async getStudentProfile(@CurrentUser() user: User) {
    console.log('Getting profile for user:', user.id, user.name);
    
    // Verify user is a student
    if (user.role !== UserRole.STUDENT) {
      throw new BadRequestException('Only students can access this endpoint');
    }

    // Get user with profile
    const student = await this.userRepository.findOne({
      where: { id: user.id },
      relations: ['profile'] // UPDATED: was 'studentProfile'
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Get user profile separately if not loaded
    let userProfile = student.profile;
    if (!userProfile) {
      userProfile = await this.userProfileRepository.findOne({
        where: { user_id: user.id }
      });
    }

    // Get student's applications using profile ID
    let applications = [];
    if (userProfile) {
      applications = await this.applicationRepository.find({
        where: { student_id: userProfile.id }, // UPDATED: Use profile ID instead of user ID
        relations: ['position', 'position.clinic'], // UPDATED: Include clinic relation
        order: { applied_at: 'DESC' }
      });
    }

    return {
      id: student.id,
      name: student.name,
      email: student.email,
      role: student.role,
      created_at: student.created_at,
      // Include user profile data if it exists
      profile: userProfile || null,
      applications: applications.map(app => ({
        id: app.id,
        status: app.status,
        applied_at: app.applied_at,
        reviewed_at: app.reviewed_at,
        cover_letter: app.cover_letter,
        notes: app.notes,
        position: app.position || null,
      }))
    };
  }

  // SECURE: User updates their own profile
  @Put('profile')
  async updateStudentProfile(
    @CurrentUser() user: User,
    @Body() updateData: { name?: string; [key: string]: any }
  ) {
    console.log('Updating profile for user:', user.id);
    
    // Verify user is a student
    if (user.role !== UserRole.STUDENT) {
      throw new BadRequestException('Only students can update student profiles');
    }

    // Update basic user info (only allow name updates for User entity)
    if (updateData.name) {
      await this.userRepository.update(user.id, { name: updateData.name });
    }

    // Update or create user profile
    // UPDATED: Use fields from UserProfile entity
    const profileFields = ['university', 'semester', 'phone', 'bio', 'year_of_study', 'specialty_interest', 'gpa']; // UPDATED: Adjust based on UserProfile fields
    const profileUpdate = Object.keys(updateData)
      .filter(key => profileFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updateData[key];
        return obj;
      }, {});

    if (Object.keys(profileUpdate).length > 0) {
      // Find existing profile or create new one
      let userProfile = await this.userProfileRepository.findOne({
        where: { user_id: user.id }
      });

      if (userProfile) {
        await this.userProfileRepository.update(userProfile.id, profileUpdate);
      } else {
        // Create new profile
        const newProfile = this.userProfileRepository.create({
          user_id: user.id,
          ...profileUpdate
        });
        await this.userProfileRepository.save(newProfile);
      }
    }
    
    return { message: 'Profile updated successfully' };
  }

  // SECURE: User gets their own applications
  @Get('applications')
  async getStudentApplications(@CurrentUser() user: User) {
    console.log('Getting applications for user:', user.id);
    
    // Verify user is a student
    if (user.role !== UserRole.STUDENT) {
      throw new BadRequestException('Only students can access applications');
    }

    // Get user profile first
    const userProfile = await this.userProfileRepository.findOne({
      where: { user_id: user.id }
    });

    if (!userProfile) {
      console.log('No user profile found for user:', user.id);
      return []; // Return empty array if no profile exists
    }
    
    const applications = await this.applicationRepository.find({
      where: { student_id: userProfile.id }, // UPDATED: Use profile ID
      relations: ['position', 'position.clinic'], // UPDATED: Include clinic relation
      order: { applied_at: 'DESC' }
    });

    return applications.map(app => ({
      id: app.id,
      status: app.status,
      applied_at: app.applied_at,
      reviewed_at: app.reviewed_at,
      cover_letter: app.cover_letter,
      notes: app.notes,
      position: app.position,
    }));
  }

  // SECURE: User creates application for themselves
  @Post('applications')
  async createApplication(
    @CurrentUser() user: User,
    @Body() applicationData: { 
      position_id: string; 
      cover_letter?: string;
    }
  ) {
    console.log('Creating application for user:', user.id);
    
    // Verify user is a student
    if (user.role !== UserRole.STUDENT) {
      throw new BadRequestException('Only students can create applications');
    }

    // Get user profile first
    const userProfile = await this.userProfileRepository.findOne({
      where: { user_id: user.id }
    });

    if (!userProfile) {
      throw new BadRequestException('User profile not found. Please complete your profile first.');
    }

    // Check if application already exists
    const existingApplication = await this.applicationRepository.findOne({
      where: { 
        student_id: userProfile.id,
        position_id: applicationData.position_id
      }
    });

    if (existingApplication) {
      throw new BadRequestException('Application already exists for this position');
    }

    const application = this.applicationRepository.create({
      student_id: userProfile.id, // UPDATED: Use profile ID
      position_id: applicationData.position_id,
      cover_letter: applicationData.cover_letter,
      status: ApplicationStatus.PENDING,
    });

    const savedApplication = await this.applicationRepository.save(application);
    
    return {
      id: savedApplication.id,
      message: 'Application submitted successfully'
    };
  }

  // SECURE: User can only update their own applications
  @Put('applications/:applicationId')
  async updateApplication(
    @CurrentUser() user: User,
    @Param('applicationId') applicationId: string,
    @Body() updateData: { cover_letter?: string }
  ) {
    console.log('Updating application for user:', user.id, 'applicationId:', applicationId);
    
    // Verify user is a student
    if (user.role !== UserRole.STUDENT) {
      throw new BadRequestException('Only students can update applications');
    }

    // Get user profile first
    const userProfile = await this.userProfileRepository.findOne({
      where: { user_id: user.id }
    });

    if (!userProfile) {
      throw new BadRequestException('User profile not found');
    }
    
    const application = await this.applicationRepository.findOne({
      where: { 
        id: applicationId, 
        student_id: userProfile.id // UPDATED: Use profile ID
      }
    });

    if (!application) {
      throw new NotFoundException('Application not found or access denied');
    }

    // Only allow updating if status is pending
    if (application.status !== ApplicationStatus.PENDING) {
      throw new BadRequestException('Cannot update application that is not pending');
    }

    // Update cover letter
    if (updateData.cover_letter !== undefined) {
      await this.applicationRepository.update(applicationId, {
        cover_letter: updateData.cover_letter
      });
    }

    return { message: 'Application updated successfully' };
  }

  // SECURE: User can only delete their own applications
  @Delete('applications/:applicationId')
  async deleteApplication(
    @CurrentUser() user: User,
    @Param('applicationId') applicationId: string
  ) {
    console.log('Deleting application for user:', user.id, 'applicationId:', applicationId);
    
    // Verify user is a student
    if (user.role !== UserRole.STUDENT) {
      throw new BadRequestException('Only students can delete applications');
    }

    // Get user profile first
    const userProfile = await this.userProfileRepository.findOne({
      where: { user_id: user.id }
    });

    if (!userProfile) {
      throw new BadRequestException('User profile not found');
    }
    
    const application = await this.applicationRepository.findOne({
      where: { 
        id: applicationId, 
        student_id: userProfile.id // UPDATED: Use profile ID
      }
    });

    if (!application) {
      throw new NotFoundException('Application not found or access denied');
    }

    // Only allow deleting pending applications
    if (application.status !== ApplicationStatus.PENDING) {
      throw new BadRequestException('Cannot delete application that is not pending');
    }

    await this.applicationRepository.remove(application);
    
    return { message: 'Application deleted successfully' };
  }

  // NEW: Create user profile if it doesn't exist
  @Post('profile')
  async createStudentProfile(
    @CurrentUser() user: User,
    @Body() profileData: {
      university?: string;
      semester?: string;
      phone?: string;
      bio?: string;
      year_of_study?: number;
      specialty_interest?: string;
      gpa?: number;
    }
  ) {
    console.log('Creating profile for user:', user.id);
    
    // Verify user is a student
    if (user.role !== UserRole.STUDENT) {
      throw new BadRequestException('Only students can create student profiles');
    }

    // Check if profile already exists
    const existingProfile = await this.userProfileRepository.findOne({
      where: { user_id: user.id }
    });

    if (existingProfile) {
      throw new BadRequestException('Profile already exists. Use PUT to update.');
    }

    // Create new profile
    const newProfile = this.userProfileRepository.create({
      user_id: user.id,
      ...profileData
    });

    const savedProfile = await this.userProfileRepository.save(newProfile);
    
    return {
      id: savedProfile.id,
      message: 'Profile created successfully',
      profile: savedProfile
    };
  }
}
