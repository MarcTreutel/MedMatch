import { DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { StudentProfile } from './entities/student-profile.entity';
import { ClinicProfile } from './entities/clinic-profile.entity';
import { Document } from './entities/document.entity';
import { InternshipPosition } from './entities/internship-position.entity';
import { Application } from './entities/application.entity';
import { FixNullStartDates1722162900000 } from './migrations/1722162900000-FixNullStartDates';

async function runMigration() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'postgres',
    database: 'medmatch',
    entities: [User, StudentProfile, ClinicProfile, Document, InternshipPosition, Application],
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('Data Source has been initialized');

    // Run the migration manually
    const migration = new FixNullStartDates1722162900000();
    await migration.up(dataSource.createQueryRunner());
    
    console.log('Migration completed successfully');
    
    await dataSource.destroy();
  } catch (err) {
    console.error('Error during Data Source initialization', err);
  }
}

runMigration();
