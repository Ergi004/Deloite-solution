import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Job } from './job.entity';
import { Skill } from '../../skills/entities/skill.entity';

@Entity()
@Unique(['jobId', 'skillId'])
export class JobSkill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('char', { length: 36 })
  @Index()
  jobId: string;

  @ManyToOne(() => Job, { onDelete: 'CASCADE' })
  @JoinColumn()
  job: Job;

  @Column('char', { length: 36 })
  @Index()
  skillId: string;

  @ManyToOne(() => Skill, { onDelete: 'CASCADE' })
  @JoinColumn()
  skill: Skill;

  @Column('int')
  minLevel: number;

  @Column('int')
  weight: number;

  @Column('boolean', { default: true })
  isRequired: boolean;
}
