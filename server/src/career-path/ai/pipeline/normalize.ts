import { StudentProfile } from '../../../students/entities/student-profile.entity';
import { UserSkill } from '../../../skills/entities/user-skill.entity';
import { Skill } from '../../../skills/entities/skill.entity';
import { StudentContext } from './types';

const MAX_FREE_TEXT = 300;

function sanitizeFreeText(value: string | null | undefined): string | null {
  if (!value) return null;
  return value.replace(/\s+/g, ' ').trim().slice(0, MAX_FREE_TEXT);
}

export function normalizeStudentContext(
  profile: StudentProfile,
  userSkills: (UserSkill & { skill: Skill })[],
): StudentContext {
  return {
    roleFamily: profile.roleFamily ?? '',
    preferredIndustry: profile.preferredIndustry ?? '',
    fieldOfStudy: profile.fieldOfStudy,
    degreeLevel: profile.degreeLevel,
    targetRole: profile.targetRole,
    targetLevel: profile.targetLevel,
    targetHorizonYears: profile.targetHorizonYears ?? 2,
    weeklyLearningHours: profile.weeklyLearningHours ?? 5,
    trackPreference: profile.trackPreference,
    expectations: profile.expectations ?? [],
    interests: profile.interests ?? [],
    skills: userSkills.map((us) => ({
      skillId: us.skillId,
      name: us.skill.name,
      level: us.level,
    })),
    softSkills: {
      ...(profile.softSkillsSelf ?? {}),
      ...(profile.softSkillsSituational ?? {}),
    },
    notableProjects: sanitizeFreeText(profile.notableProjects),
    goalStatement: sanitizeFreeText(profile.goalStatement),
  };
}
