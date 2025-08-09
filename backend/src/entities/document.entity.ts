import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { StudentProfile } from './student-profile.entity';

export enum DocumentType {
  CV = 'cv',
  CERTIFICATE = 'certificate',
  OTHER = 'other'
}

@Entity({ name: 'documents' })
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  student_id: string;

  @ManyToOne(() => StudentProfile, student => student.documents)
  @JoinColumn({ name: 'student_id' })
  student: StudentProfile;

  @Column()
  title: string;

  @Column({
    type: 'enum',
    enum: DocumentType,
    default: DocumentType.OTHER
  })
  type: DocumentType;

  @Column()
  file_path: string;

  @Column()
  file_name: string;

  @CreateDateColumn()
  uploaded_at: Date;
}
