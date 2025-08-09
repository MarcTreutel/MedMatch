import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne } from 'typeorm';
import { StudentProfile } from './student-profile.entity';
import { ClinicProfile } from './clinic-profile.entity';

export enum UserRole {
  STUDENT = 'student',
  CLINIC = 'clinic',
  ADMIN = 'admin'
}

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  auth0_id: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  name: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.STUDENT
  })
  role: UserRole;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne(() => StudentProfile, studentProfile => studentProfile.user)
  studentProfile: StudentProfile;

  @OneToOne(() => ClinicProfile, clinicProfile => clinicProfile.user)
  clinicProfile: ClinicProfile;
}
