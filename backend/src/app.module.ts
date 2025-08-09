import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersController } from './controllers/users.controller';
import { User } from './entities/user.entity';
import { StudentProfile } from './entities/student-profile.entity';
import { ClinicProfile } from './entities/clinic-profile.entity';
import { Document } from './entities/document.entity';
import { InternshipPosition } from './entities/internship-position.entity';
import { Application } from './entities/application.entity';
import { StudentsController } from './controllers/students.controller';
import { ClinicsController } from './controllers/clinics.controller';
import { PositionsController } from './controllers/positions.controller';
import { ApplicationsController } from './controllers/applications.controller';
import { DocumentsController } from './controllers/documents.controller';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'medmatch_dev',
      entities: [User, StudentProfile, ClinicProfile, Document, InternshipPosition, Application],
      synchronize: true, // Enable for development
    }),
    TypeOrmModule.forFeature([User, StudentProfile, ClinicProfile, Document, InternshipPosition, Application]),
  ],
  controllers: [
    AppController,
    UsersController,
    StudentsController,
    ClinicsController,
    PositionsController,
    ApplicationsController,
    DocumentsController,
  ],
  providers: [AppService],
})
export class AppModule {}
