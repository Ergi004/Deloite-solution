import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Course } from './course.entity';
import { Skill } from '../../skills/entities/skill.entity';

@Entity()
@Unique(['courseId', 'skillId'])
export class CourseSkill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('char', { length: 36 })
  @Index()
  courseId: string;

  @ManyToOne(() => Course, { onDelete: 'CASCADE' })
  @JoinColumn()
  course: Course;

  @Column('char', { length: 36 })
  @Index()
  skillId: string;

  @ManyToOne(() => Skill, { onDelete: 'CASCADE' })
  @JoinColumn()
  skill: Skill;

  @Column('int')
  levelGained: number;
}
