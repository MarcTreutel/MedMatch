import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Import ALL your controllers
import { StudentsController } from './controllers/students.controller';
import { UsersController } from './controllers/users.controller'; // 🔧 Add this
import { ApplicationsController } from './controllers/applications.controller'; // 🔧 Add this too
import { ClinicsController } from './controllers/clinics.controller'; // 🔧 And this
import { PositionsController } from './controllers/positions.controller'; // 🔧 And this
import { DocumentsController } from './controllers/documents.controller'; // 🔧 And this

// Import your actual entities
import { User } from './entities/user.entity';
import { Application } from './entities/application.entity';
import { StudentProfile } from './entities/student-profile.entity';
import { ClinicProfile } from './entities/clinic-profile.entity';
import { InternshipPosition } from './entities/internship-position.entity';
import { Document } from './entities/document.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: String(process.env.DB_PASSWORD || ''),
      database: process.env.DB_DATABASE || 'medmatch',
      entities: [User, Application, StudentProfile, ClinicProfile, InternshipPosition, Document],
      synchronize: true,
      logging: false,
    }),
    
    TypeOrmModule.forFeature([
      User, 
      Application, 
      StudentProfile, 
      ClinicProfile, 
      InternshipPosition, 
      Document
    ]),
  ],
  controllers: [
    AppController,
    StudentsController,
    UsersController, // 🔧 Add this
    ApplicationsController, // 🔧 Add these too
    ClinicsController,
    PositionsController,
    DocumentsController,
  ],
  providers: [AppService],
})
export class AppModule {}







