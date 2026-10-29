import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Job } from './job.entity';

@Entity()
export class JobProgression {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('char', { length: 36 })
  @Index()
  fromJobId: string;

  @ManyToOne(() => Job, { onDelete: 'CASCADE' })
  @JoinColumn()
  fromJob: Job;

  @Column('char', { length: 36 })
  @Index()
  toJobId: string;

  @ManyToOne(() => Job, { onDelete: 'CASCADE' })
  @JoinColumn()
  toJob: Job;

  @Column('int')
  typicalMonths: number;

  @Column('varchar', { length: 300, nullable: true })
  notes: string | null;
}
