import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, OneToOne, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { InternshipPosition } from './internship-position.entity';

@Entity({ name: 'clinic_profiles' })
export class ClinicProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @OneToOne(() => User, user => user.clinicProfile)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  clinic_name: string;

  @Column({ nullable: true })
  department: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  contact_person: string;

  @Column({ nullable: true })
  phone: string;

  @OneToMany(() => InternshipPosition, position => position.clinic)
  positions: InternshipPosition[];
}
