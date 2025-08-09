import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, OneToOne, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Application } from './application.entity';
import { Document } from './document.entity';

@Entity({ name: 'student_profiles' })
export class StudentProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @OneToOne(() => User, user => user.studentProfile)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  university: string;

  @Column()
  year_of_study: number;

  @Column({ nullable: true })
  specialization: string;

  @Column({ nullable: true })
  cv_file_path: string;

  @Column({ nullable: true })
  phone: string;

  @OneToMany(() => Application, application => application.student)
  applications: Application[];

  @OneToMany(() => Document, document => document.student)
  documents: Document[];
}
