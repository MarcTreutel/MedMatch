import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Application } from './entities/application.entity';
import { InternshipPosition } from './entities/internship-position.entity';
import { ClinicProfile } from './entities/clinic-profile.entity';
import { StudentProfile } from './entities/student-profile.entity';
import { User } from './entities/user.entity';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Get repositories
  const applicationRepo = app.get(getRepositoryToken(Application));
  const positionRepo = app.get(getRepositoryToken(InternshipPosition));
  const clinicRepo = app.get(getRepositoryToken(ClinicProfile));
  const studentRepo = app.get(getRepositoryToken(StudentProfile));
  const userRepo = app.get(getRepositoryToken(User));
  
  console.log('=== DEBUG: DATABASE RELATIONSHIPS ===');
  
  // Get all applications
  const applications = await applicationRepo.find();
  console.log(`\n[1] Total applications in DB: ${applications.length}`);
  
  if (applications.length > 0) {
    // For each application, get related data
    for (const app of applications) {
      console.log(`\n[2] Application ID: ${app.id}, Status: ${app.status}`);
      
      // Get position
      const position = await positionRepo.findOne({ where: { id: app.position_id } });
      console.log(`[3] Position ID: ${position?.id}, Title: ${position?.title}`);
      
      // Get clinic
      if (position) {
        const clinic = await clinicRepo.findOne({ where: { id: position.clinic_id } });
        console.log(`[4] Clinic ID: ${clinic?.id}, Name: ${clinic?.clinic_name}`);
        
        // Get clinic user
        if (clinic) {
          const clinicUser = await userRepo.findOne({ where: { id: clinic.user_id } });
          console.log(`[5] Clinic User ID: ${clinicUser?.id}, Auth0 ID: ${clinicUser?.auth0_id}`);
        }
      }
      
      // Get student
      const student = await studentRepo.findOne({ where: { id: app.student_id } });
      console.log(`[6] Student ID: ${student?.id}, University: ${student?.university}`);
      
      // Get student user
      if (student) {
        const studentUser = await userRepo.findOne({ where: { id: student.user_id } });
        console.log(`[7] Student User ID: ${studentUser?.id}, Auth0 ID: ${studentUser?.auth0_id}`);
      }
    }
  }
  
  // Get all positions
  const positions = await positionRepo.find();
  console.log(`\n[8] Total positions in DB: ${positions.length}`);
  
  // Get all clinics
  const clinics = await clinicRepo.find();
  console.log(`\n[9] Total clinics in DB: ${clinics.length}`);
  for (const clinic of clinics) {
    const user = await userRepo.findOne({ where: { id: clinic.user_id } });
    console.log(`[10] Clinic ID: ${clinic.id}, Name: ${clinic.clinic_name}, Auth0 ID: ${user?.auth0_id}`);
  }
  
  await app.close();
}

bootstrap();
