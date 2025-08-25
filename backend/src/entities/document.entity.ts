// backend/src/entities/document.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { UserProfile } from './user-profile.entity';

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

  @ManyToOne(() => UserProfile, profile => profile.documents)
  @JoinColumn({ name: 'student_id' })
  student: UserProfile;

  @Column()
  filename: string;

  @Column()
  path: string;

  @Column({
    type: 'enum',
    enum: DocumentType
  })
  type: DocumentType;

  @CreateDateColumn()
  uploaded_at: Date;
}
