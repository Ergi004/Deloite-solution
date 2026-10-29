export interface StudentContext {
  roleFamily: string;
  preferredIndustry: string;
  fieldOfStudy: string | null;
  degreeLevel: string | null;
  targetRole: string | null;
  targetLevel: string | null;
  targetHorizonYears: number;
  weeklyLearningHours: number;
  trackPreference: string | null;
  expectations: string[];
  interests: string[];
  skills: { skillId: string; name: string; level: number }[];
  softSkills: Record<string, number>;
  notableProjects: string | null;
  goalStatement: string | null;
}

export interface CandidateJobSkillGap {
  skillId: string;
  name: string;
  currentLevel: number;
  requiredLevel: number;
  weight: number;
}

export interface RequiredSkillRef {
  skillId: string;
  name: string;
  minLevel: number;
  weight: number;
}

export interface SelectedJob {
  id: string;
  title: string;
  roleFamily: string;
  industry: string;
  seniority: string;
  isAdjacent: boolean;
  requiredSkills: RequiredSkillRef[];
  promotionCriteria: string[];
  monthsToProductivity: number;
}

export interface CandidateJob {
  id: string;
  title: string;
  roleFamily: string;
  industry: string;
  seniority: string;
  isAdjacent: boolean;
  fitScore: number;
  gaps: CandidateJobSkillGap[];
  requiredSkillIds: string[];
  promotionCriteria: string[];
  monthsToProductivity: number;
}

export interface CandidateCourse {
  id: string;
  title: string;
  provider: string;
  estimatedHours: number;
  level: string;
  format: string;
  skillIds: string[];
  skillsGained: { skillId: string; levelGained: number }[];
}

export interface ProgressionLadderEntry {
  jobId: string;
  title: string;
  typicalMonthsFromStart: number;
  promotionCriteria: string[];
}

export interface FilterResult {
  candidateJobs: SelectedJob[];
  candidateCourses: CandidateCourse[];
  progressionLadders: ProgressionLadderEntry[];
}

export interface NoMatchResult {
  noMatch: true;
}

export interface GenerationConstraints {
  horizonMonths: number;
  weeklyHours: number;
  maxTotalHours: number;
}
