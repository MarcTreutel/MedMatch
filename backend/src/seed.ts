import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { Clinic } from './entities/clinic.entity'; // UPDATED: was ClinicProfile
import { InternshipPosition, PositionStatus } from './entities/internship-position.entity';

async function seed() {
  const app = await NestFactory.create(AppModule);
  const dataSource = app.get(DataSource);
  
  const userRepo = dataSource.getRepository(User);
  const clinicRepo = dataSource.getRepository(Clinic); // UPDATED: was ClinicProfile
  const positionRepo = dataSource.getRepository(InternshipPosition);

  // Create sample clinic organization first
  const clinic = await clinicRepo.save({
    name: 'Charité - Campus Mitte',
    department: 'Internal Medicine',
    address: 'Charitéplatz 1, 10117 Berlin',
    contact_person: 'Dr. Mueller',
    phone: '+49 30 450 50'
  });

  // Create sample clinic admin user
  const clinicAdmin = await userRepo.save({
    auth0_id: 'sample_clinic_admin_1',
    email: 'admin@charite-mitte.de',
    name: 'Dr. Mueller - Charité Mitte',
    role: UserRole.CLINIC_ADMIN, // UPDATED: was UserRole.CLINIC
    clinic_id: clinic.id // UPDATED: Link to clinic organization
  });

  // Create sample positions
  await positionRepo.save([
    {
      clinic_id: clinic.id, // UPDATED: Use clinic organization ID
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
      clinic_id: clinic.id, // UPDATED: Use clinic organization ID
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
