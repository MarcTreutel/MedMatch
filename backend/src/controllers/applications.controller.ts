import { Controller, Get, Post, Body, Param, Put } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application, ApplicationStatus } from '../entities/application.entity';
import { StudentProfile } from '../entities/student-profile.entity';
import { InternshipPosition } from '../entities/internship-position.entity';
import { User } from '../entities/user.entity';

@Controller('api/applications')
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

  @Get()
  async getAllApplications() {
    try {
      console.log('Fetching all applications');
      // Get all applications with related data
      const applications = await this.applicationRepository.find({
        relations: ['student', 'student.user', 'position', 'position.clinic', 'position.clinic.user']
      });
      
      // Ensure position_id is available for each application
      const result = applications.map(app => ({
        ...app,
        position_id: app.position?.id || app.position_id
      }));
      
      console.log(`Found ${applications.length} applications`);
      return result;
    } catch (error) {
      console.error('Error fetching applications:', error);
      return []; // Return empty array on error
    }
  }

  @Get('student/:auth0Id')
  async getStudentApplications(@Param('auth0Id') auth0Id: string) {
    try {
      console.log('Fetching applications for student:', auth0Id);
      // Find the user by auth0 ID
      const user = await this.userRepository.findOne({
        where: { auth0_id: auth0Id }
      });

      if (!user) {
        console.log('User not found for auth0Id:', auth0Id);
        return []; // Return empty array if user not found
      }

      // Find the student profile
      const student = await this.studentRepository.findOne({
        where: { user_id: user.id }
      });

      if (!student) {
        console.log('Student profile not found for user:', user.id);
        return []; // Return empty array if student not found
      }

      // Get applications for this student with position details
      const applications = await this.applicationRepository.find({
        where: { student_id: student.id },
        relations: ['position', 'position.clinic', 'position.clinic.user']
      });

      // Ensure position_id is available for each application
      const result = applications.map(app => ({
        ...app,
        position_id: app.position?.id || app.position_id
      }));

      console.log(`Found ${applications.length} applications for student ${student.id}`);
      return result;
    } catch (error) {
      console.error('Error fetching student applications:', error);
      return []; // Return empty array on error
    }
  }

  @Get('position/:positionId')
  async getPositionApplications(@Param('positionId') positionId: string) {
    try {
      console.log('Fetching applications for position:', positionId);
      // Get applications for this position with student details
      const applications = await this.applicationRepository.find({
        where: { position_id: positionId },
        relations: ['student', 'student.user']
      });

      console.log(`Found ${applications.length} applications for position ${positionId}`);
      return applications;
    } catch (error) {
      console.error('Error fetching position applications:', error);
      return []; // Return empty array on error
    }
  }

  @Post()
  async createApplication(@Body() applicationData: any) {
    try {
      const { auth0Id, positionId, coverLetter } = applicationData;
      console.log('Creating application:', { auth0Id, positionId });

      // Find the user by auth0 ID
      const user = await this.userRepository.findOne({
        where: { auth0_id: auth0Id }
      });

      if (!user) {
        console.log('User not found for auth0Id:', auth0Id);
        return { error: 'User not found' };
      }

      // Find the student profile
      const student = await this.studentRepository.findOne({
        where: { user_id: user.id }
      });

      if (!student) {
        console.log('Student profile not found for user:', user.id);
        return { error: 'Student profile not found' };
      }

      // Find the position
      const position = await this.positionRepository.findOne({
        where: { id: positionId }
      });

      if (!position) {
        console.log('Position not found:', positionId);
        return { error: 'Position not found' };
      }

      // Check if application already exists
      const existingApplication = await this.applicationRepository.findOne({
        where: {
          student_id: student.id,
          position_id: position.id
        }
      });

      if (existingApplication) {
        console.log('Application already exists');
        return { error: 'You have already applied to this position' };
      }

      // Create the application
      const application = this.applicationRepository.create({
        student_id: student.id,
        position_id: position.id,
        cover_letter: coverLetter,
        status: ApplicationStatus.PENDING,
        applied_at: new Date()
      });

      const savedApplication = await this.applicationRepository.save(application);
      console.log('Application created:', savedApplication.id);

      return { success: true, application: savedApplication };
    } catch (error) {
      console.error('Error creating application:', error);
      return { error: 'Failed to create application' };
    }
  }

  @Put(':id/status')
  async updateApplicationStatus(@Param('id') id: string, @Body() data: any) {
    try {
      const { status, notes } = data;
      console.log('Updating application status:', { id, status });

      const application = await this.applicationRepository.findOne({
        where: { id }
      });

      if (!application) {
        console.log('Application not found:', id);
        return { error: 'Application not found' };
      }

      application.status = status;
      application.notes = notes;
      application.reviewed_at = new Date();

      const updatedApplication = await this.applicationRepository.save(application);
      console.log('Application updated:', updatedApplication.id);

      return { success: true, application: updatedApplication };
    } catch (error) {
      console.error('Error updating application status:', error);
      return { error: 'Failed to update application status' };
    }
  }
}
