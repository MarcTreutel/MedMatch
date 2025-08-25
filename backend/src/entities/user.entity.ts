// backend/src/entities/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, ManyToOne, JoinColumn } from 'typeorm';
import { UserProfile } from './user-profile.entity';
import { Clinic } from './clinic.entity'; // Renamed from ClinicProfile

export enum UserRole {
  STUDENT = 'student',
  CLINIC_ADMIN = 'clinic_admin',
  CLINIC_MEMBER = 'clinic_member',
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
    nullable: true
  })
  role: UserRole | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // New one-to-one relationship with UserProfile
  @OneToOne(() => UserProfile, profile => profile.user)
  profile: UserProfile;

  // New many-to-one relationship with Clinic
  @ManyToOne(() => Clinic, clinic => clinic.members, { nullable: true })
  @JoinColumn({ name: 'clinic_id' })
  clinic: Clinic;

  @Column({ nullable: true })
  clinic_id: string;
}

