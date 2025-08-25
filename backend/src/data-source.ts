// src/data-source.ts
import { DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';
import { Clinic } from './entities/clinic.entity';
import { Document } from './entities/document.entity';
import { InternshipPosition } from './entities/internship-position.entity';
import { Application } from './entities/application.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'temppass123',
  database: process.env.DB_NAME || 'medmatch',
  entities: [User, UserProfile, Clinic, Document, InternshipPosition, Application],
  migrations: ['dist/migrations/*.js'],
  synchronize: false,
  logging: true,
});
