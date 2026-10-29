import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Company } from '../../companies/entities/company.entity';
import { CourseFormat, CourseLevel } from '../../types/enums';

@Entity()
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('char', { length: 36, nullable: true })
  @Index()
  companyId: string | null;

  @ManyToOne(() => Company, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn()
  company: Company | null;

  @Column('varchar', { length: 200 })
  title: string;

  @Column('varchar', { length: 150 })
  provider: string;

  @Column('varchar', { length: 500 })
  url: string;

  @Column({ type: 'enum', enum: CourseFormat })
  format: CourseFormat;

  @Column({ type: 'enum', enum: CourseLevel })
  level: CourseLevel;

  @Column('int')
  estimatedHours: number;

  @Column('varchar', { length: 50, default: 'English' })
  language: string;

  @Column('varchar', { length: 50, default: 'Free' })
  cost: string;

  @Column('boolean', { default: false })
  isInternal: boolean;
}
