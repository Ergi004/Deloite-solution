import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { TrackPreference } from '../../types/enums';

@Entity()
export class StudentProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('char', { length: 36 })
  userId: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  // Identity / contact
  @Column('varchar', { length: 100, nullable: true })
  firstName: string | null;

  @Column('varchar', { length: 100, nullable: true })
  lastName: string | null;

  @Column('varchar', { length: 32, nullable: true })
  phone: string | null;

  @Column('varchar', { length: 100, nullable: true })
  city: string | null;

  @Column('varchar', { length: 100, nullable: true })
  country: string | null;

  @Column('varchar', { length: 500, nullable: true })
  avatarUrl: string | null;

  @Column('text', { nullable: true })
  bio: string | null;

  @Column('varchar', { length: 300, nullable: true })
  linkedinUrl: string | null;

  @Column('varchar', { length: 300, nullable: true })
  githubUrl: string | null;

  @Column('varchar', { length: 300, nullable: true })
  portfolioUrl: string | null;

  @Column({ type: 'date', nullable: true })
  availableFrom: string | null;

  // Step 1: Studies
  @Column('varchar', { length: 150, nullable: true })
  university: string | null;

  @Column('varchar', { length: 50, nullable: true })
  degreeLevel: string | null;

  @Column('varchar', { length: 150, nullable: true })
  fieldOfStudy: string | null;

  @Column('int', { nullable: true })
  graduationYear: number | null;

  @Column('decimal', { precision: 3, scale: 2, nullable: true })
  gpa: string | null;

  @Column('text', { nullable: true })
  notableProjects: string | null;

  @Column('json', { nullable: true })
  languages: { language: string; level: string }[] | null;

  // Step 2: industry and interests
  @Column('varchar', { length: 100, nullable: true })
  preferredIndustry: string | null;

  @Column('json', { nullable: true })
  interests: string[] | null;

  @Column('json', { nullable: true })
  dayToDayPreferences: string[] | null;

  @Column('text', { nullable: true })
  dayToDayOther: string | null;

  // Step 4: soft skills
  @Column('json', { nullable: true })
  softSkillsSelf: Record<string, number> | null;

  @Column('json', { nullable: true })
  softSkillsSituational: Record<string, number> | null;

  // Step 5: career direction
  @Column('varchar', { length: 100, nullable: true })
  roleFamily: string | null;

  @Column('varchar', { length: 150, nullable: true })
  targetRole: string | null;

  @Column({ type: 'enum', enum: TrackPreference, nullable: true })
  trackPreference: TrackPreference | null;

  // Step 6: goals and timeline
  @Column('int', { nullable: true })
  targetHorizonYears: number | null;

  @Column('varchar', { length: 50, nullable: true })
  targetLevel: string | null;

  @Column('text', { nullable: true })
  goalStatement: string | null;

  @Column('int', { nullable: true })
  weeklyLearningHours: number | null;

  @Column('json', { nullable: true })
  expectations: string[] | null;

  @Column('varchar', { length: 100, nullable: true })
  salaryExpectationBand: string | null;

  // Consent and onboarding state
  @Column({ type: 'datetime', precision: 3, nullable: true })
  consentPrivacyAt: Date | null;

  @Column({ type: 'datetime', precision: 3, nullable: true })
  consentAiAt: Date | null;

  @Column('int', { default: 1 })
  onboardingStep: number;

  @Column({ type: 'datetime', precision: 3, nullable: true })
  onboardingCompletedAt: Date | null;

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
