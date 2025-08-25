// src/controllers/clinics.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, Req, UseGuards, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Clinic } from '../entities/clinic.entity'; // UPDATED: was clinic-profile.entity
import { User, UserRole } from '../entities/user.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('clinics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.CLINIC_ADMIN, UserRole.ADMIN) // UPDATED: was UserRole.CLINIC
export class ClinicsController {
  constructor(
    @InjectRepository(Clinic) // UPDATED: was ClinicProfile
    private clinicRepository: Repository<Clinic>, // UPDATED: was ClinicProfile
  ) {}

  @Get('profile')
  async getProfile(@Req() req: any) {
    const user: User = req.user;
    
    // UPDATED: Check for CLINIC_ADMIN instead of CLINIC
    if (user.role !== UserRole.CLINIC_ADMIN && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Access denied');
    }

    // UPDATED: Use the clinic relationship instead of finding by user_id
    if (user.clinic) {
      return user.clinic;
    }

    // If no clinic is associated, return null or create a new one
    return null;
  }

  @Post('profile')
  async createOrUpdateProfile(@Body() profileData: any, @Req() req: any) {
    const user: User = req.user;
    
    // UPDATED: Check for CLINIC_ADMIN instead of CLINIC
    if (user.role !== UserRole.CLINIC_ADMIN && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Access denied');
    }

    let clinic: Clinic;

    if (user.clinic) {
      // Update existing clinic
      await this.clinicRepository.update(user.clinic.id, profileData);
      clinic = await this.clinicRepository.findOne({ where: { id: user.clinic.id } });
    } else {
      // Create new clinic
      const clinicData = {
        name: profileData.name || 'Unnamed Clinic',
        department: profileData.department,
        address: profileData.address,
        contact_person: profileData.contact_person,
        phone: profileData.phone,
    };
  
  clinic = await this.clinicRepository.save(clinicData);
  
  // TODO: Update user to associate with this clinic
  // This would require access to the user repository
}

    return clinic;
  }

  @Get()
  async getAllClinics(@Req() req: any) {
    const user: User = req.user;
    
    // UPDATED: Check for CLINIC_ADMIN instead of CLINIC
    if (user.role !== UserRole.CLINIC_ADMIN && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Access denied');
    }

    return this.clinicRepository.find({
      relations: ['members', 'positions'] // UPDATED: Include new relationships
    });
  }

  @Delete(':id')
  async deleteClinic(@Param('id') id: string, @Req() req: any) {
    const user: User = req.user;
    
    // UPDATED: Check for CLINIC_ADMIN instead of CLINIC
    if (user.role !== UserRole.CLINIC_ADMIN && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Access denied');
    }

    await this.clinicRepository.delete(id);
    return { message: 'Clinic deleted successfully' };
  }
}


