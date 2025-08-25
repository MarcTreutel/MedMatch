// backend/src/entities/internship-position.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Clinic } from './clinic.entity';
import { Application } from './application.entity';

export enum PositionStatus {
  ACTIVE = 'active',
  CLOSED = 'closed',
  DRAFT = 'draft'
}

@Entity({ name: 'internship_positions' })
export class InternshipPosition {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  clinic_id: string;

  @ManyToOne(() => Clinic, clinic => clinic.positions)
  @JoinColumn({ name: 'clinic_id' })
  clinic: Clinic;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column()
  specialty: string;

  @Column()
  duration_months: number;

  @Column({ nullable: true })
  start_date: Date;

  @Column({ nullable: true })
  application_deadline: Date;

  @Column({ nullable: true, type: 'text' })
  requirements: string;

  @Column({
    type: 'enum',
    enum: PositionStatus,
    default: PositionStatus.ACTIVE
  })
  status: PositionStatus;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => Application, application => application.position)
  applications: Application[];
}

