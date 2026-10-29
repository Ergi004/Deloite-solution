import {
  CareerPathStatus,
  CourseFormat,
  CourseLevel,
  JobStatus,
  PathFeedback,
  Seniority,
  SkillCategory,
  TrackPreference,
  UserRole,
  UserStatus,
  WorkMode,
} from './enums';

export interface PublicUser {
  id: string;
  email: string;
  role: UserRole;
  companyId: string | null;
  status: UserStatus;
}

export interface Company {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  industries: string[];
  defaultInviteExpiryDays: number;
}

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  roleFamilies: string[];
  description: string;
}

export interface UserSkill {
  id: string;
  userId: string;
  skillId: string;
  level: number;
  skill: Skill;
}

export interface Course {
  id: string;
  companyId: string | null;
  title: string;
  provider: string;
  url: string;
  format: CourseFormat;
  level: CourseLevel;
  estimatedHours: number;
  language: string;
  cost: string;
  isInternal: boolean;
}

export interface Job {
  id: string;
  companyId: string;
  code: string;
  title: string;
  department: string;
  roleFamily: string;
  industry: string;
  seniority: Seniority;
  employmentType: string;
  location: string;
  workMode: WorkMode;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string | null;
  openings: number;
  status: JobStatus;
  targetStartDate: string | null;
  closingDate: string | null;
  summary: string;
  responsibilities: string[];
  niceToHaveSkills: string[] | null;
  toolsAndTech: string[];
  educationRequirement: string;
  minYearsExperience: string;
  languages: string[];
  softSkillRequirements: string[];
  monthsToProductivity: number;
  promotionCriteria: string[];
  reportsTo: string | null;
  teamSize: number | null;
  createdAt: string;
  updatedAt: string;
  skills?: { skillId: string; minLevel: number; weight: number; isRequired: boolean }[];
}

export interface StudentProfile {
  id: string;
  userId: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  city: string | null;
  country: string | null;
  avatarUrl: string | null;
  bio: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  portfolioUrl: string | null;
  availableFrom: string | null;
  university: string | null;
  degreeLevel: string | null;
  fieldOfStudy: string | null;
  graduationYear: number | null;
  gpa: string | null;
  notableProjects: string | null;
  languages: { language: string; level: string }[] | null;
  preferredIndustry: string | null;
  interests: string[] | null;
  dayToDayPreferences: string[] | null;
  dayToDayOther: string | null;
  softSkillsSelf: Record<string, number> | null;
  softSkillsSituational: Record<string, number> | null;
  roleFamily: string | null;
  targetRole: string | null;
  trackPreference: TrackPreference | null;
  targetHorizonYears: number | null;
  targetLevel: string | null;
  goalStatement: string | null;
  weeklyLearningHours: number | null;
  expectations: string[] | null;
  salaryExpectationBand: string | null;
  onboardingStep: number;
  onboardingCompletedAt: string | null;
}

export interface CareerPathOutput {
  summary: string;
  primaryTarget: {
    jobId: string;
    title: string;
    whyItFits: string;
    fitScore: number;
    estimatedMonthsToReady: number;
  };
  alternatives: { jobId: string; title: string; tradeOff: string; isAdjacent: boolean }[];
  skillGaps: {
    skillId: string;
    name: string;
    currentLevel: number;
    requiredLevel: number;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
  }[];
  strengths: { skillId: string; name: string; note: string }[];
  phases: {
    order: number;
    title: string;
    startMonth: number;
    endMonth: number;
    focus: string;
    skillsToBuild: { skillId: string; targetLevel: number }[];
    courses: { courseId: string; reason: string; estimatedHours: number }[];
    milestone: { description: string; evidence: string };
    successSignal: string;
  }[];
  progressionLadder: {
    jobId: string;
    title: string;
    typicalMonthsFromStart: number;
    promotionCriteria: string[];
  }[];
  weeklyPlan: { hoursPerWeek: number; suggestedSplit: { activity: string; hours: number }[] };
  considerations: string[];
  nextSteps: string[];
}

export interface CareerPath {
  id: string;
  userId: string;
  version: number;
  status: CareerPathStatus;
  output: CareerPathOutput | null;
  validationReport: Record<string, unknown> | null;
  generationMethod: 'AI' | 'FALLBACK' | null;
  feedback: PathFeedback | null;
  feedbackNote: string | null;
  createdAt: string;
}

export interface Invitation {
  id: string;
  companyId: string;
  email: string | null;
  expiresAt: string;
  usedAt: string | null;
  revokedAt: string | null;
  note: string | null;
  createdAt: string;
  status: 'pending' | 'used' | 'expired' | 'revoked';
}
