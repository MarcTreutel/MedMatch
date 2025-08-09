import { Controller, Get, Post, Body } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InternshipPosition, PositionStatus } from '../entities/internship-position.entity';

@Controller('api/positions')
export class PositionsController {
  constructor(
    @InjectRepository(InternshipPosition)
    private positionRepository: Repository<InternshipPosition>,
  ) {}

  @Get()
  async getAllPositions() {
    const positions = await this.positionRepository.find({
      relations: ['clinic', 'clinic.user'],
      where: { status: PositionStatus.ACTIVE },
      order: { created_at: 'DESC' }
    });
    
    return positions;
  }

  @Post()
  async createPosition(@Body() positionData: any) {
    try {
      const {
        clinic_id,
        title,
        description,
        specialty,
        duration_months,
        start_date,
        application_deadline,
        requirements,
        status
      } = positionData;

      const newPosition = await this.positionRepository.save({
        clinic_id,
        title,
        description,
        specialty,
        duration_months,
        start_date: new Date(start_date),
        application_deadline: new Date(application_deadline),
        requirements,
        status: status === 'active' ? PositionStatus.ACTIVE : PositionStatus.CLOSED
      });

      return { success: true, position: newPosition };
    } catch (error) {
      console.error('Error creating position:', error);
      return { success: false, error: 'Failed to create position' };
    }
  }
}
