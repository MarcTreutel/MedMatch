import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';
import { Application, ApplicationStatus } from '../entities/application.entity';
import { StudentProfile } from '../entities/student-profile.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/user.decorator';

@Controller('api/students')
@UseGuards(JwtAuthGuard) // 🔒 Protect all routes in this controller
export class StudentsController {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    @InjectRepository(StudentProfile)
    private studentProfileRepository: Repository<StudentProfile>,
  ) {}

  // ✅ SECURE: User gets their own profile from JWT token
  @Get('profile')
  async getStudentProfile(@CurrentUser() user: User) {
    console.log('Getting profile for user:', user.id, user.name);
    
    // Verify user is a student
    if (user.role !== UserRole.STUDENT) {
      throw new BadRequestException('Only students can access this endpoint');
    }

    // Get user with student profile
    const student = await this.userRepository.findOne({
      where: { id: user.id },
      relations: ['studentProfile']
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Get student's applications (using correct field name: student_id)
    const applications = await this.applicationRepository.find({
      where: { student_id: user.id },
      relations: ['position'], // Relation to InternshipPosition
      order: { applied_at: 'DESC' } // Use correct field name
    });

    return {
      id: student.id,
      name: student.name,
      email: student.email,
      role: student.role,
      created_at: student.created_at,
      // Include student profile data if it exists
      profile: student.studentProfile || null,
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

  // ✅ SECURE: User updates their own profile
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

    // Update or create student profile
    // Note: You'll need to check what fields exist in your StudentProfile entity
    const profileFields = ['university', 'semester', 'phone', 'bio', 'year_of_study']; // Adjust based on your actual StudentProfile fields
    const profileUpdate = Object.keys(updateData)
      .filter(key => profileFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updateData[key];
        return obj;
      }, {});

    if (Object.keys(profileUpdate).length > 0) {
      // Find existing profile or create new one
      let studentProfile = await this.studentProfileRepository.findOne({
        where: { user_id: user.id } // Assuming user_id field exists
      });

      if (studentProfile) {
        await this.studentProfileRepository.update(studentProfile.id, profileUpdate);
      } else {
        // Create new profile
        const newProfile = this.studentProfileRepository.create({
          user_id: user.id,
          ...profileUpdate
        });
        await this.studentProfileRepository.save(newProfile);
      }
    }
    
    return { message: 'Profile updated successfully' };
  }

  // ✅ SECURE: User gets their own applications
  @Get('applications')
  async getStudentApplications(@CurrentUser() user: User) {
    console.log('Getting applications for user:', user.id);
    
    // Verify user is a student
    if (user.role !== UserRole.STUDENT) {
      throw new BadRequestException('Only students can access applications');
    }
    
    const applications = await this.applicationRepository.find({
      where: { student_id: user.id }, // Correct field name
      relations: ['position'], // Relation to InternshipPosition
      order: { applied_at: 'DESC' } // Correct field name
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

  // ✅ SECURE: User creates application for themselves
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

    const application = this.applicationRepository.create({
      student_id: user.id, // Automatically set from JWT token!
      position_id: applicationData.position_id, // Correct field name
      cover_letter: applicationData.cover_letter,
      status: ApplicationStatus.PENDING, // Use enum
    });

    const savedApplication = await this.applicationRepository.save(application);
    
    return {
      id: savedApplication.id,
      message: 'Application submitted successfully'
    };
  }

  // ✅ SECURE: User can only update their own applications
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
    
    const application = await this.applicationRepository.findOne({
      where: { 
        id: applicationId, 
        student_id: user.id // Critical: Only user's own applications!
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

  // ✅ SECURE: User can only delete their own applications
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
    
    const application = await this.applicationRepository.findOne({
      where: { 
        id: applicationId, 
        student_id: user.id // Critical: Only user's own applications!
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
}



