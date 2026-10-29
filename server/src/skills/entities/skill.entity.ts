import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { SkillCategory } from '../../types/enums';

@Entity()
@Unique(['name'])
export class Skill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 150 })
  name: string;

  @Column({ type: 'enum', enum: SkillCategory })
  category: SkillCategory;

  @Column('json')
  roleFamilies: string[];

  @Column('text')
  description: string;
}
