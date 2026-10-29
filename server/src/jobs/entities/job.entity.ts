import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Company } from '../../companies/entities/company.entity';
import { JobStatus, Seniority, WorkMode } from '../../types/enums';

@Entity()
@Unique(['companyId', 'code'])
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('char', { length: 36 })
  @Index()
  companyId: string;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn()
  company: Company;

  @Column('varchar', { length: 30 })
  code: string;

  @Column('varchar', { length: 150 })
  title: string;

  @Column('varchar', { length: 100 })
  department: string;

  @Column('varchar', { length: 100 })
  @Index()
  roleFamily: string;

  @Column('varchar', { length: 100 })
  @Index()
  industry: string;

  @Column({ type: 'enum', enum: Seniority })
  seniority: Seniority;

  @Column('varchar', { length: 50, default: 'Full-time' })
  employmentType: string;

  @Column('varchar', { length: 150 })
  location: string;

  @Column({ type: 'enum', enum: WorkMode })
  workMode: WorkMode;

  @Column('int', { nullable: true })
  salaryMin: number | null;

  @Column('int', { nullable: true })
  salaryMax: number | null;

  @Column('varchar', { length: 10, nullable: true })
  salaryCurrency: string | null;

  @Column('int', { default: 1 })
  openings: number;

  @Column({ type: 'enum', enum: JobStatus, default: JobStatus.DRAFT })
  @Index()
  status: JobStatus;

  @Column({ type: 'date', nullable: true })
  targetStartDate: string | null;

  @Column({ type: 'date', nullable: true })
  closingDate: string | null;

  @Column('text')
  summary: string;

  @Column('json')
  responsibilities: string[];

  @Column('json', { nullable: true })
  niceToHaveSkills: string[] | null;

  @Column('json')
  toolsAndTech: string[];

  @Column('varchar', { length: 200 })
  educationRequirement: string;

  @Column('decimal', { precision: 3, scale: 1, default: 0 })
  minYearsExperience: string;

  @Column('json')
  languages: string[];

  @Column('json')
  softSkillRequirements: string[];

  @Column('int')
  monthsToProductivity: number;

  @Column('json')
  promotionCriteria: string[];

  @Column('varchar', { length: 150, nullable: true })
  reportsTo: string | null;

  @Column('int', { nullable: true })
  teamSize: number | null;

  @CreateDateColumn({
    type: 'datetime',
    precision: 3,
    default: () => 'CURRENT_TIMESTAMP(3)',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'datetime',
    precision: 3,
    default: () => 'CURRENT_TIMESTAMP(3)',
    onUpdate: 'CURRENT_TIMESTAMP(3)',
  })
  updatedAt: Date;
}
