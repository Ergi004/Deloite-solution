import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Skill } from './entities/skill.entity';
import { UserSkill } from './entities/user-skill.entity';
import { SkillSource } from '../types/enums';

export interface UpsertUserSkillInput {
  skillId: string;
  level: number;
  source?: SkillSource;
}

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(Skill)
    private readonly skillRepository: Repository<Skill>,
    @InjectRepository(UserSkill)
    private readonly userSkillRepository: Repository<UserSkill>,
  ) {}

  findAll(): Promise<Skill[]> {
    return this.skillRepository.find({
      order: { category: 'ASC', name: 'ASC' },
    });
  }

  findByIds(ids: string[]): Promise<Skill[]> {
    if (ids.length === 0) return Promise.resolve([]);
    return this.skillRepository.find({ where: { id: In(ids) } });
  }

  async findForUser(userId: string): Promise<(UserSkill & { skill: Skill })[]> {
    return this.userSkillRepository.find({
      where: { userId },
      relations: { skill: true },
    });
  }

  async replaceUserSkills(
    userId: string,
    skills: UpsertUserSkillInput[],
  ): Promise<void> {
    await this.userSkillRepository.delete({ userId });
    if (skills.length === 0) return;
    const rows = skills.map((s) =>
      this.userSkillRepository.create({
        userId,
        skillId: s.skillId,
        level: s.level,
        source: s.source ?? SkillSource.SELF,
      }),
    );
    await this.userSkillRepository.save(rows);
  }

  async upsertOne(
    userId: string,
    input: UpsertUserSkillInput,
  ): Promise<UserSkill> {
    const existing = await this.userSkillRepository.findOne({
      where: { userId, skillId: input.skillId },
    });
    if (existing) {
      existing.level = input.level;
      existing.source = input.source ?? existing.source;
      return this.userSkillRepository.save(existing);
    }
    const row = this.userSkillRepository.create({
      userId,
      skillId: input.skillId,
      level: input.level,
      source: input.source ?? SkillSource.SELF,
    });
    return this.userSkillRepository.save(row);
  }

  async removeOne(userId: string, skillId: string): Promise<void> {
    await this.userSkillRepository.delete({ userId, skillId });
  }
}
