import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';
import { ClinicProfile } from '../entities/clinic-profile.entity';

@Controller('api/clinics')
export class ClinicsController {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(ClinicProfile)
    private clinicRepository: Repository<ClinicProfile>,
  ) {}

  @Get('profile/:auth0Id')
  async getClinicProfile(@Param('auth0Id') auth0Id: string) {
    const user = await this.userRepository.findOne({
      where: { auth0_id: auth0Id }
    });

    if (!user) {
      return null;
    }

    const profile = await this.clinicRepository.findOne({
      where: { user_id: user.id }
    });

    return profile;
  }

  @Post('profile')
  async saveClinicProfile(@Body() data: any) {
    try {
      const { auth0Id, email, name, clinic_name, department, address, contact_person, phone } = data;

      // Find or create user
      let user = await this.userRepository.findOne({
        where: { auth0_id: auth0Id }
      });

      if (!user) {
        user = await this.userRepository.save({
          auth0_id: auth0Id,
          email,
          name,
          role: UserRole.CLINIC
        });
      }

      // Find or create profile
      let profile = await this.clinicRepository.findOne({
        where: { user_id: user.id }
      });

      if (profile) {
        // Update existing profile
        profile.clinic_name = clinic_name;
        profile.department = department;
        profile.address = address;
        profile.contact_person = contact_person;
        profile.phone = phone;
        await this.clinicRepository.save(profile);
      } else {
        // Create new profile
        profile = await this.clinicRepository.save({
          user_id: user.id,
          clinic_name,
          department,
          address,
          contact_person,
          phone
        });
      }

      return { success: true, profile };
    } catch (error) {
      console.error('Error saving clinic profile:', error);
      return { success: false, error: 'Failed to save profile' };
    }
  }
}
