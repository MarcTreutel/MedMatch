import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InternshipPosition, PositionStatus } from '../entities/internship-position.entity';
import { User, UserRole } from '../entities/user.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/user.decorator';
import { Roles } from '../auth/roles.decorator';

@Controller('api/positions')
// @UseGuards(JwtAuthGuard) // 🔥 TEMPORARILY COMMENTED OUT
export class PositionsController {
  constructor(
    @InjectRepository(InternshipPosition)
    private positionRepository: Repository<InternshipPosition>,
  ) {}

  // ✅ PUBLIC: Everyone can view active positions
  @Get()
  // @Roles(UserRole.STUDENT, UserRole.CLINIC, UserRole.ADMIN) // 🔥 TEMPORARILY COMMENTED OUT
  async getAllPositions(
    // @CurrentUser() user: User // 🔥 TEMPORARILY COMMENTED OUT
  ) {
    console.log('Getting all active positions');
    
    try {
      const positions = await this.positionRepository.find({
        relations: ['clinic', 'clinic.user'],
        where: { status: PositionStatus.ACTIVE },
        order: { created_at: 'DESC' }
      });
      
      console.log(`Found ${positions.length} active positions`);
      return positions;
    } catch (error) {
      console.error('Error fetching positions:', error);
      return [];
    }
  }

  // ✅ PUBLIC: Get single position (for detailed view)
  @Get(':id')
  // @Roles(UserRole.STUDENT, UserRole.CLINIC, UserRole.ADMIN) // 🔥 TEMPORARILY COMMENTED OUT
  async getPosition(
    @Param('id') id: string
    // @CurrentUser() user: User // 🔥 TEMPORARILY COMMENTED OUT
  ) {
    console.log('Getting position:', id);
    
    try {
      const position = await this.positionRepository.findOne({
        where: { id },
        relations: ['clinic', 'clinic.user']
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

  // 🔥 TEMPORARILY DISABLED: Only clinics can create positions
  @Post()
  // @Roles(UserRole.CLINIC, UserRole.ADMIN) // 🔥 TEMPORARILY COMMENTED OUT
  async createPosition(
    // @CurrentUser() user: User, // 🔥 TEMPORARILY COMMENTED OUT
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
    console.log('Creating position - JWT disabled, returning error');
    // 🔥 TEMPORARY: Can't create positions without knowing who the user is
    throw new BadRequestException('Position creation temporarily disabled - JWT authentication required');
  }

  // 🔥 TEMPORARILY DISABLED: Only clinic owners can update their positions
  @Put(':id')
  // @Roles(UserRole.CLINIC, UserRole.ADMIN) // 🔥 TEMPORARILY COMMENTED OUT
  async updatePosition(
    // @CurrentUser() user: User, // 🔥 TEMPORARILY COMMENTED OUT
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
    console.log('Updating position - JWT disabled, returning error');
    // 🔥 TEMPORARY: Can't update positions without knowing who the user is
    throw new BadRequestException('Position update temporarily disabled - JWT authentication required');
  }

  // 🔥 TEMPORARILY DISABLED: Only clinic owners can delete their positions
  @Delete(':id')
  // @Roles(UserRole.CLINIC, UserRole.ADMIN) // 🔥 TEMPORARILY COMMENTED OUT
  async deletePosition(
    // @CurrentUser() user: User, // 🔥 TEMPORARILY COMMENTED OUT
    @Param('id') id: string
  ) {
    console.log('Deleting position - JWT disabled, returning error');
    // 🔥 TEMPORARY: Can't delete positions without knowing who the user is
    throw new BadRequestException('Position deletion temporarily disabled - JWT authentication required');
  }

  // 🔥 TEMPORARILY DISABLED: Get positions created by current user
  @Get('my/positions')
  // @Roles(UserRole.CLINIC, UserRole.ADMIN) // 🔥 TEMPORARILY COMMENTED OUT
  async getMyPositions(
    // @CurrentUser() user: User // 🔥 TEMPORARILY COMMENTED OUT
  ) {
    console.log('Getting my positions - JWT disabled, returning empty array');
    // 🔥 TEMPORARY: Can't identify user without JWT, return empty array
    return [];
  }
}


