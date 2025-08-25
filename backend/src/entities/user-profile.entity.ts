// backend/src/entities/user-profile.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, OneToOne, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Document } from './document.entity';
import { Application } from './application.entity';

@Entity({ name: 'user_profiles' })
export class UserProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @OneToOne(() => User, user => user.profile)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Common profile fields
  @Column({ nullable: true })
  phone: string;

  // Student-specific fields
  @Column({ nullable: true })
  university: string;

  @Column({ nullable: true })
  year_of_study: number;

  @Column({ nullable: true })
  specialization: string;

  // For backward compatibility during migration
  @Column({ nullable: true })
  cv_file_path: string;

  // Relationships for student role
  @OneToMany(() => Application, application => application.student, { nullable: true })
  applications: Application[];

  @OneToMany(() => Document, document => document.student, { nullable: true })
  documents: Document[];
}

