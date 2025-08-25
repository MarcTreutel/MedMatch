import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';

import { AppController } from './app.controller';
import { AppService } from './app.service';

// Import ALL your controllers
import { StudentsController } from './controllers/students.controller';
import { UsersController } from './controllers/users.controller';
import { ApplicationsController } from './controllers/applications.controller';
import { ClinicsController } from './controllers/clinics.controller';
import { PositionsController } from './controllers/positions.controller';
import { DocumentsController } from './controllers/documents.controller';

// Import your updated entities
import { User } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity'; // NEW
import { Application } from './entities/application.entity';
import { Clinic } from './entities/clinic.entity'; // RENAMED from ClinicProfile
import { InternshipPosition } from './entities/internship-position.entity';
import { Document } from './entities/document.entity';

// Import guards
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/roles.guard';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: String(process.env.DB_PASSWORD || ''),
      database: process.env.DB_DATABASE || 'medmatch',
      // Updated entities array
      entities: [
        User, 
        UserProfile,        // NEW: Replaces StudentProfile
        Application, 
        Clinic,            // RENAMED: Was ClinicProfile
        InternshipPosition, 
        Document
      ],
      synchronize: false, // 🔥 IMPORTANT: Set to false when using migrations
      logging: true,      // 🔥 Enable logging to see migration queries
      migrations: ['dist/migrations/*.js'], // 🔥 Add migrations path
      migrationsRun: false, // 🔥 Don't auto-run migrations
    }),
    
    TypeOrmModule.forFeature([
      User, 
      UserProfile,        // NEW: Replaces StudentProfile
      Application, 
      Clinic,            // RENAMED: Was ClinicProfile
      InternshipPosition, 
      Document
    ]),
  ],

  controllers: [
    AppController,
    StudentsController,
    UsersController,
    ApplicationsController,
    ClinicsController,
    PositionsController,
    DocumentsController,
  ],

  providers: [
    AppService,
    //{
    //  provide: APP_GUARD,
    //  useClass: JwtAuthGuard,
    //},
    //{
    //  provide: APP_GUARD,
    //  useClass: RolesGuard,
    //},
  ],
})
export class AppModule {}
