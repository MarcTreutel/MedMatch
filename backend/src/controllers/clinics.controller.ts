// backend/src/controllers/clinics.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, Req, UseGuards, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Clinic } from '../entities/clinic.entity';
import { User, UserRole } from '../entities/user.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/user.decorator';

@Controller('api/clinics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.CLINIC_ADMIN, UserRole.CLINIC_MEMBER) // Only clinic users can access
export class ClinicsController {
  constructor(
    @InjectRepository(Clinic)
    private clinicRepository: Repository<Clinic>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  @Get('profile')
  async getMyClinicProfile(@CurrentUser() user: User) {
    console.log('Getting clinic profile for user:', user.id);

    try {
      if (!user.clinic_id) {
        return { error: 'User is not associated with any clinic' };
      }

      const clinic = await this.clinicRepository.findOne({
        where: { id: user.clinic_id },
        relations: ['members', 'positions']
      });

      if (!clinic) {
        return { error: 'Clinic not found' };
      }

      return clinic;
    } catch (error) {
      console.error('Error fetching clinic profile:', error);
      return { error: 'Failed to fetch clinic profile' };
    }
  }

  @Put('profile')
  @Roles(UserRole.CLINIC_ADMIN) // Only clinic admins can update
  async updateMyClinicProfile(
    @CurrentUser() user: User,
    @Body() profileData: {
      name?: string;
      department?: string;
      address?: string;
      contact_person?: string;
      phone?: string;
    }
  ) {
    console.log('Updating clinic profile for user:', user.id);

    try {
      if (!user.clinic_id) {
        throw new ForbiddenException('User is not associated with any clinic');
      }

      const clinic = await this.clinicRepository.findOne({
        where: { id: user.clinic_id }
      });

      if (!clinic) {
        throw new ForbiddenException('Clinic not found');
      }

      // Update clinic
      Object.assign(clinic, profileData);
      const updatedClinic = await this.clinicRepository.save(clinic);

      // Return with relations
      const clinicWithRelations = await this.clinicRepository.findOne({
        where: { id: user.clinic_id },
        relations: ['members', 'positions']
      });

      return clinicWithRelations;
    } catch (error) {
      console.error('Error updating clinic profile:', error);
      if (error instanceof ForbiddenException) {
        throw error;
      }
      return { error: 'Failed to update clinic profile' };
    }
  }

  @Get('members')
  async getMyClinicMembers(@CurrentUser() user: User) {
    console.log('Getting clinic members for user:', user.id);

    try {
      if (!user.clinic_id) {
        return { error: 'User is not associated with any clinic' };
      }

      const clinic = await this.clinicRepository.findOne({
        where: { id: user.clinic_id },
        relations: ['members', 'members.profile']
      });

      if (!clinic) {
        return { error: 'Clinic not found' };
      }

      return {
        clinic: {
          id: clinic.id,
          name: clinic.name
        },
        members: clinic.members || []
      };
    } catch (error) {
      console.error('Error fetching clinic members:', error);
      return { error: 'Failed to fetch clinic members' };
    }
  }

  @Put('members/:userId/promote')
  @Roles(UserRole.CLINIC_ADMIN) // Only clinic admins can promote
  async promoteMemberToAdmin(
    @CurrentUser() user: User,
    @Param('userId') userId: string
  ) {
    console.log('Promoting clinic member to admin:', { clinicId: user.clinic_id, userId });

    try {
      if (!user.clinic_id) {
        throw new ForbiddenException('User is not associated with any clinic');
      }

      const targetUser = await this.userRepository.findOne({ where: { id: userId } });
      if (!targetUser) {
        return { success: false, error: 'User not found' };
      }

      if (targetUser.clinic_id !== user.clinic_id) {
        throw new ForbiddenException('User does not belong to your clinic');
      }

      if (targetUser.role === UserRole.CLINIC_ADMIN) {
        return { success: false, error: 'User is already a clinic admin' };
      }

      targetUser.role = UserRole.CLINIC_ADMIN;
      const updatedUser = await this.userRepository.save(targetUser);

      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Error promoting member to admin:', error);
      if (error instanceof ForbiddenException) {
        throw error;
      }
      return { success: false, error: 'Failed to promote user to clinic admin' };
    }
  }
}
