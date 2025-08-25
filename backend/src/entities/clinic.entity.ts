// backend/src/entities/clinic.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { InternshipPosition } from './internship-position.entity';

@Entity({ name: 'clinics' })
export class Clinic {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  department: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  contact_person: string;

  @Column({ nullable: true })
  phone: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // One clinic can have many members (users)
  @OneToMany(() => User, user => user.clinic)
  members: User[];

  // One clinic can have many positions
  @OneToMany(() => InternshipPosition, position => position.clinic)
  positions: InternshipPosition[];
}

