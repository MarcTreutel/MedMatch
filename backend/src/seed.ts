import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { ClinicProfile } from './entities/clinic-profile.entity';
import { InternshipPosition, PositionStatus } from './entities/internship-position.entity';

async function seed() {
  const app = await NestFactory.create(AppModule);
  const dataSource = app.get(DataSource);

  const userRepo = dataSource.getRepository(User);
  const clinicRepo = dataSource.getRepository(ClinicProfile);
  const positionRepo = dataSource.getRepository(InternshipPosition);

  // Create sample clinic
  const clinic = await userRepo.save({
    auth0_id: 'sample_clinic_1',
    email: 'admin@charite-mitte.de',
    name: 'Dr. Mueller - Charité Mitte',
    role: UserRole.CLINIC
  });

  const clinicProfile = await clinicRepo.save({
    user_id: clinic.id,
    clinic_name: 'Charité - Campus Mitte',
    department: 'Internal Medicine',
    address: 'Charitéplatz 1, 10117 Berlin',
    contact_person: 'Dr. Mueller',
    phone: '+49 30 450 50'
  });

  // Create sample positions
  await positionRepo.save([
    {
      clinic_id: clinicProfile.id,
      title: 'Internal Medicine Internship',
      description: 'Comprehensive internship in internal medicine with exposure to various subspecialties.',
      specialty: 'Internal Medicine',
      duration_months: 6,
      start_date: new Date('2025-03-01'),
      application_deadline: new Date('2025-02-15'),
      requirements: 'Medical student in 4th year or higher',
      status: PositionStatus.ACTIVE
    },
    {
      clinic_id: clinicProfile.id,
      title: 'Cardiology Research Position',
      description: 'Research-focused position in interventional cardiology.',
      specialty: 'Cardiology',
      duration_months: 4,
      start_date: new Date('2025-04-01'),
      application_deadline: new Date('2025-03-15'),
      requirements: 'Strong interest in cardiovascular medicine',
      status: PositionStatus.ACTIVE
    }
  ]);

  console.log('✅ Sample data created!');
  await app.close();
}

seed().catch(console.error);
