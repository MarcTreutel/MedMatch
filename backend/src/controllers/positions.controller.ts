import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InternshipPosition, PositionStatus } from '../entities/internship-position.entity';
import { User, UserRole } from '../entities/user.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/user.decorator';
import { Roles } from '../auth/roles.decorator';

@Controller('api/positions')
@UseGuards(JwtAuthGuard) // UPDATED: Re-enabled JWT guard
export class PositionsController {
  constructor(
    @InjectRepository(InternshipPosition)
    private positionRepository: Repository<InternshipPosition>,
  ) {}

  // PUBLIC: Everyone can view active positions
  @Get()
  @Roles(UserRole.STUDENT, UserRole.CLINIC_ADMIN, UserRole.CLINIC_MEMBER, UserRole.ADMIN) // UPDATED: Include all new roles
  async getAllPositions(
    @CurrentUser() user: User
  ) {
    console.log('Getting all active positions for user:', user.id);
    
    try {
      const positions = await this.positionRepository.find({
        relations: ['clinic'], // UPDATED: Simplified relation - clinic is now a proper entity
        where: { status: PositionStatus.ACTIVE },
        order: { created_at: 'DESC' }
      });
      
      console.log(`Found ${positions.length} active positions`);
      return positions;
    } catch (error) {
      console.error('Error fetching positions:', error);
      throw new BadRequestException('Failed to fetch positions');
    }
  }

  // PUBLIC: Get single position (for detailed view)
  @Get(':id')
  @Roles(UserRole.STUDENT, UserRole.CLINIC_ADMIN, UserRole.CLINIC_MEMBER, UserRole.ADMIN) // UPDATED: Include all new roles
  async getPosition(
    @Param('id') id: string,
    @CurrentUser() user: User
  ) {
    console.log('Getting position:', id, 'for user:', user.id);
    
    try {
      const position = await this.positionRepository.findOne({
        where: { id },
        relations: ['clinic'] // UPDATED: Simplified relation
      });
      
      if (!position) {
        throw new NotFoundException('Position not found');
      }
      
      return position;
    } catch (error) {
      console.error('Error fetching position:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to fetch position');
    }
  }

  // SECURE: Only clinic admins can create positions
  @Post()
  @Roles(UserRole.CLINIC_ADMIN, UserRole.ADMIN) // UPDATED: Only clinic admins can create positions
  async createPosition(
    @CurrentUser() user: User,
    @Body() positionData: {
      title: string;
      description: string;
      specialty: string;
      duration_months: number;
      start_date: string;
      application_deadline: string;
      requirements: string;
      status?: string;
    }
  ) {
    console.log('Creating position for user:', user.id);

    try {
      // Verify user has a clinic
      if (!user.clinic_id) {
        throw new BadRequestException('User is not associated with a clinic');
      }

      // Create position
      const position = this.positionRepository.create({
        ...positionData,
        clinic_id: user.clinic_id, // UPDATED: Use clinic_id from user
        status: positionData.status as PositionStatus || PositionStatus.ACTIVE
      });

      const savedPosition = await this.positionRepository.save(position);

      console.log('Position created:', savedPosition.id);
      return savedPosition;
    } catch (error) {
      console.error('Error creating position:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create position');
    }
  }

  // SECURE: Only clinic owners can update their positions
  @Put(':id')
  @Roles(UserRole.CLINIC_ADMIN, UserRole.ADMIN) // UPDATED: Only clinic admins can update positions
  async updatePosition(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() updateData: {
      title?: string;
      description?: string;
      specialty?: string;
      duration_months?: number;
      start_date?: string;
      application_deadline?: string;
      requirements?: string;
      status?: string;
    }
  ) {
    console.log('Updating position:', id, 'for user:', user.id);

    try {
      // Find position and verify ownership
      const position = await this.positionRepository.findOne({
        where: { id }
      });

      if (!position) {
        throw new NotFoundException('Position not found');
      }

      // Verify the position belongs to the user's clinic
      if (position.clinic_id !== user.clinic_id) { // UPDATED: Use clinic_id
        throw new BadRequestException('Access denied - position does not belong to your clinic');
      }

      // Update position
      Object.assign(position, updateData);
      
      if (updateData.status) {
        position.status = updateData.status as PositionStatus;
      }

      const updatedPosition = await this.positionRepository.save(position);

      console.log('Position updated:', updatedPosition.id);
      return updatedPosition;
    } catch (error) {
      console.error('Error updating position:', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to update position');
    }
  }

  // SECURE: Only clinic owners can delete their positions
  @Delete(':id')
  @Roles(UserRole.CLINIC_ADMIN, UserRole.ADMIN) // UPDATED: Only clinic admins can delete positions
  async deletePosition(
    @CurrentUser() user: User,
    @Param('id') id: string
  ) {
    console.log('Deleting position:', id, 'for user:', user.id);

    try {
      // Find position and verify ownership
      const position = await this.positionRepository.findOne({
        where: { id }
      });

      if (!position) {
        throw new NotFoundException('Position not found');
      }

      // Verify the position belongs to the user's clinic
      if (position.clinic_id !== user.clinic_id) { // UPDATED: Use clinic_id
        throw new BadRequestException('Access denied - position does not belong to your clinic');
      }

      // Check if position has applications
      // Note: You might want to prevent deletion if there are applications
      // const applicationCount = await this.applicationRepository.count({
      //   where: { position_id: id }
      // });
      // if (applicationCount > 0) {
      //   throw new BadRequestException('Cannot delete position with existing applications');
      // }

      await this.positionRepository.remove(position);

      console.log('Position deleted:', id);
      return { success: true, message: 'Position deleted successfully' };
    } catch (error) {
      console.error('Error deleting position:', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to delete position');
    }
  }

  // SECURE: Get positions created by current user's clinic
  @Get('my/positions')
  @Roles(UserRole.CLINIC_ADMIN, UserRole.CLINIC_MEMBER, UserRole.ADMIN) // UPDATED: Include clinic members
  async getMyPositions(
    @CurrentUser() user: User
  ) {
    console.log('Getting positions for user clinic:', user.id);

    try {
      // Verify user has a clinic
      if (!user.clinic_id) {
        throw new BadRequestException('User is not associated with a clinic');
      }

      const positions = await this.positionRepository.find({
        where: { clinic_id: user.clinic_id }, // UPDATED: Use clinic_id
        relations: ['clinic'], // UPDATED: Include clinic relation
        order: { created_at: 'DESC' }
      });

      console.log(`Found ${positions.length} positions for clinic`);
      return positions;
    } catch (error) {
      console.error('Error fetching my positions:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to fetch positions');
    }
  }

  // NEW: Get positions with application counts (for clinic dashboard)
  @Get('my/positions-with-stats')
  @Roles(UserRole.CLINIC_ADMIN, UserRole.CLINIC_MEMBER, UserRole.ADMIN)
  async getMyPositionsWithStats(
    @CurrentUser() user: User
  ) {
    console.log('Getting positions with stats for user clinic:', user.id);

    try {
      // Verify user has a clinic
      if (!user.clinic_id) {
        throw new BadRequestException('User is not associated with a clinic');
      }

      // Get positions with application counts using raw query
      const positionsWithStats = await this.positionRepository.query(`
        SELECT 
          p.*,
          c.name as clinic_name,
          COALESCE(app_counts.application_count, 0) as application_count,
          COALESCE(app_counts.pending_count, 0) as pending_applications
        FROM internship_positions p
        LEFT JOIN clinics c ON p.clinic_id = c.id
        LEFT JOIN (
          SELECT 
            position_id,
            COUNT(*) as application_count,
            COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count
          FROM applications 
          GROUP BY position_id
        ) app_counts ON p.id = app_counts.position_id
        WHERE p.clinic_id = $1
        ORDER BY p.created_at DESC
      `, [user.clinic_id]);

      console.log(`Found ${positionsWithStats.length} positions with stats for clinic`);
      return positionsWithStats;
    } catch (error) {
      console.error('Error fetching positions with stats:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to fetch positions with statistics');
    }
  }
}
