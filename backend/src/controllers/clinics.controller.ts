import { Controller, Get, Post, Put, Body, Param, UseGuards, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';
import { ClinicProfile } from '../entities/clinic-profile.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/user.decorator';
import { Roles } from '../auth/roles.decorator'; // 🔥 ADD THIS

@Controller('api/clinics')
@UseGuards(JwtAuthGuard) // 🔒 Protect all routes in this controller
@Roles(UserRole.CLINIC, UserRole.ADMIN) // 🔥 ADD THIS - Only clinics and admins can access
export class ClinicsController {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(ClinicProfile)
    private clinicRepository: Repository<ClinicProfile>,
  ) {}

  // ✅ SECURE: User gets their own profile from JWT token
  @Get('profile')
  async getClinicProfile(@CurrentUser() user: User) {
    console.log('Getting clinic profile for user:', user.id, user.name);
    
    // 🔥 UPDATED: Allow admins to access clinic endpoints (but only their own data)
    if (user.role !== UserRole.CLINIC && user.role !== UserRole.ADMIN) {
      throw new BadRequestException('Only clinics and admins can access this endpoint');
    }

    // Get user with clinic profile
    const clinic = await this.userRepository.findOne({
      where: { id: user.id },
      relations: ['clinicProfile']
    });

    if (!clinic) {
      throw new NotFoundException('Clinic not found');
    }

    // Get clinic profile
    const profile = await this.clinicRepository.findOne({
      where: { user_id: user.id } // Always user's own profile
    });

    return {
      id: clinic.id,
      name: clinic.name,
      email: clinic.email,
      role: clinic.role,
      created_at: clinic.created_at,
      // Include clinic profile data if it exists
      profile: profile || null
    };
  }

  // ✅ SECURE: User updates their own profile
  @Post('profile')
  async saveClinicProfile(
    @CurrentUser() user: User,
    @Body() data: { 
      name?: string;
      clinic_name?: string;
      department?: string;
      address?: string;
      contact_person?: string;
      phone?: string;
    }
  ) {
    console.log('Saving clinic profile for user:', user.id);
    
    // 🔥 UPDATED: Allow admins to update clinic profiles (their own)
    if (user.role !== UserRole.CLINIC && user.role !== UserRole.ADMIN) {
      throw new BadRequestException('Only clinics and admins can update clinic profiles');
    }

    try {
      const { name, clinic_name, department, address, contact_person, phone } = data;

      // Update basic user info if provided
      if (name) {
        await this.userRepository.update(user.id, { name });
      }

      // Find or create clinic profile
      let profile = await this.clinicRepository.findOne({
        where: { user_id: user.id } // Always user's own profile
      });

      if (profile) {
        // Update existing profile
        const updateData: Partial<ClinicProfile> = {};
        if (clinic_name !== undefined) updateData.clinic_name = clinic_name;
        if (department !== undefined) updateData.department = department;
        if (address !== undefined) updateData.address = address;
        if (contact_person !== undefined) updateData.contact_person = contact_person;
        if (phone !== undefined) updateData.phone = phone;

        await this.clinicRepository.update(profile.id, updateData);
      } else {
        // Create new profile
        profile = this.clinicRepository.create({
          user_id: user.id,
          clinic_name,
          department,
          address,
          contact_person,
          phone
        });
        await this.clinicRepository.save(profile);
      }

      return { 
        success: true, 
        message: 'Clinic profile updated successfully',
        profile 
      };
    } catch (error) {
      console.error('Error saving clinic profile:', error);
      throw new BadRequestException('Failed to save clinic profile');
    }
  }

  // ✅ SECURE: User updates their own profile (PUT method for REST compliance)
  @Put('profile')
  async updateClinicProfile(
    @CurrentUser() user: User,
    @Body() updateData: { 
      name?: string;
      clinic_name?: string;
      department?: string;
      address?: string;
      contact_person?: string;
      phone?: string;
    }
  ) {
    console.log('Updating clinic profile for user:', user.id);
    
    // 🔥 UPDATED: Allow admins to update clinic profiles (their own)
    if (user.role !== UserRole.CLINIC && user.role !== UserRole.ADMIN) {
      throw new BadRequestException('Only clinics and admins can update clinic profiles');
    }

    // Update basic user info if provided
    if (updateData.name) {
      await this.userRepository.update(user.id, { name: updateData.name });
    }

    // Update clinic profile fields
    const profileFields = ['clinic_name', 'department', 'address', 'contact_person', 'phone'];
    const profileUpdate = Object.keys(updateData)
      .filter(key => profileFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updateData[key];
        return obj;
      }, {});

    if (Object.keys(profileUpdate).length > 0) {
      // Find existing profile or create new one
      let clinicProfile = await this.clinicRepository.findOne({
        where: { user_id: user.id } // Always user's own profile
      });

      if (clinicProfile) {
        await this.clinicRepository.update(clinicProfile.id, profileUpdate);
      } else {
        // Create new profile
        const newProfile = this.clinicRepository.create({
          user_id: user.id,
          ...profileUpdate
        });
        await this.clinicRepository.save(newProfile);
      }
    }
    
    return { message: 'Clinic profile updated successfully' };
  }

  // 🚫 REMOVED INSECURE ENDPOINT:
  // - GET profile/:auth0Id (allowed anyone to access any clinic's profile by auth0Id)
  // This was a security vulnerability and has been removed
}

