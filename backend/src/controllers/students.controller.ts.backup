import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';
import { StudentProfile } from '../entities/student-profile.entity';

@Controller('api/students')
export class StudentsController {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(StudentProfile)
    private studentRepository: Repository<StudentProfile>,
  ) {}

  @Get('profile/:auth0Id')
  async getStudentProfile(@Param('auth0Id') auth0Id: string) {
    const user = await this.userRepository.findOne({
      where: { auth0_id: auth0Id }
    });

    if (!user) {
      return null;
    }

    const profile = await this.studentRepository.findOne({
      where: { user_id: user.id }
    });

    return profile;
  }

  @Post('profile')
  async saveStudentProfile(@Body() data: any) {
    try {
      const { auth0Id, email, name, university, year_of_study, specialization, phone } = data;

      // Find or create user
      let user = await this.userRepository.findOne({
        where: { auth0_id: auth0Id }
      });

      if (!user) {
        user = await this.userRepository.save({
          auth0_id: auth0Id,
          email,
          name,
          role: UserRole.STUDENT
        });
      }

      // Find or create profile
      let profile = await this.studentRepository.findOne({
        where: { user_id: user.id }
      });

      if (profile) {
        // Update existing profile
        profile.university = university;
        profile.year_of_study = year_of_study;
        profile.specialization = specialization;
        profile.phone = phone;
        await this.studentRepository.save(profile);
      } else {
        // Create new profile
        profile = await this.studentRepository.save({
          user_id: user.id,
          university,
          year_of_study,
          specialization,
          phone
        });
      }

      return { success: true, profile };
    } catch (error) {
      console.error('Error saving student profile:', error);
      return { success: false, error: 'Failed to save profile' };
    }
  }
}
