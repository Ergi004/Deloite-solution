import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  CareerPathStatus,
  GenerationMethod,
  PathFeedback,
} from '../../types/enums';

@Entity()
export class CareerPath {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('char', { length: 36 })
  @Index()
  userId: string;

  @Column('int')
  version: number;

  @Column({
    type: 'enum',
    enum: CareerPathStatus,
    default: CareerPathStatus.GENERATING,
  })
  status: CareerPathStatus;

  @Column('json', { nullable: true })
  inputSnapshot: Record<string, unknown> | null;

  @Column('json', { nullable: true })
  output: Record<string, unknown> | null;

  @Column('json', { nullable: true })
  validationReport: Record<string, unknown> | null;

  @Column({ type: 'enum', enum: GenerationMethod, nullable: true })
  generationMethod: GenerationMethod | null;

  @Column('varchar', { length: 100, nullable: true })
  model: string | null;

  @Column('varchar', { length: 50, nullable: true })
  promptVersion: string | null;

  @Column('int', { nullable: true })
  tokensIn: number | null;

  @Column('int', { nullable: true })
  tokensOut: number | null;

  @Column({ type: 'enum', enum: PathFeedback, nullable: true })
  feedback: PathFeedback | null;

  @Column('varchar', { length: 500, nullable: true })
  feedbackNote: string | null;

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
