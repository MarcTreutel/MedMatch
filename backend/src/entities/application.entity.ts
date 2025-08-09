import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { StudentProfile } from './student-profile.entity';
import { InternshipPosition } from './internship-position.entity';

export enum ApplicationStatus {
  PENDING = 'pending',
  REVIEWED = 'reviewed',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected'
}

@Entity({ name: 'applications' })
export class Application {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  student_id: string;

  @ManyToOne(() => StudentProfile, student => student.applications)
  @JoinColumn({ name: 'student_id' })
  student: StudentProfile;

  @Column()
  position_id: string;

  @ManyToOne(() => InternshipPosition, position => position.applications)
  @JoinColumn({ name: 'position_id' })
  position: InternshipPosition;

  @Column({ type: 'text', nullable: true })
  cover_letter: string;

  @Column({
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.PENDING
  })
  status: ApplicationStatus;

  @CreateDateColumn()
  applied_at: Date;

  @Column({ nullable: true })
  reviewed_at: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;
}
