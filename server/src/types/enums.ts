export enum UserRole {
  COMPANY_ADMIN = 'COMPANY_ADMIN',
  STUDENT = 'STUDENT',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
  PENDING = 'PENDING',
}

export enum SkillCategory {
  TECHNICAL = 'TECHNICAL',
  TOOL = 'TOOL',
  SOFT = 'SOFT',
  DOMAIN = 'DOMAIN',
  LANGUAGE = 'LANGUAGE',
}

export enum SkillSource {
  SELF = 'SELF',
  ASSESSED = 'ASSESSED',
  COURSE_VERIFIED = 'COURSE_VERIFIED',
}

export enum Seniority {
  INTERN = 'INTERN',
  JUNIOR = 'JUNIOR',
  MID = 'MID',
  SENIOR = 'SENIOR',
  LEAD = 'LEAD',
}

export enum WorkMode {
  ONSITE = 'ONSITE',
  HYBRID = 'HYBRID',
  REMOTE = 'REMOTE',
}

export enum JobStatus {
  DRAFT = 'DRAFT',
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  PLANNED = 'PLANNED',
}

export enum CourseFormat {
  VIDEO = 'VIDEO',
  READING = 'READING',
  PROJECT = 'PROJECT',
  BOOTCAMP = 'BOOTCAMP',
  CERTIFICATION = 'CERTIFICATION',
  MENTORING = 'MENTORING',
  INTERNAL = 'INTERNAL',
}

export enum CourseLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
}

export enum CareerPathStatus {
  GENERATING = 'GENERATING',
  READY = 'READY',
  FAILED = 'FAILED',
  SUPERSEDED = 'SUPERSEDED',
}

export enum GenerationMethod {
  AI = 'AI',
  FALLBACK = 'FALLBACK',
}

export enum PathFeedback {
  UP = 'UP',
  DOWN = 'DOWN',
}

export enum SkillPriority {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export enum TrackPreference {
  INDIVIDUAL_CONTRIBUTOR = 'INDIVIDUAL_CONTRIBUTOR',
  PEOPLE_LEADERSHIP = 'PEOPLE_LEADERSHIP',
  UNSURE = 'UNSURE',
}

export enum RoleFamily {
  ENGINEERING = 'Engineering',
  DATA = 'Data',
  DESIGN = 'Design',
  PRODUCT = 'Product',
  MARKETING = 'Marketing',
  SALES = 'Sales',
  FINANCE = 'Finance',
  HR = 'HR',
  OPERATIONS = 'Operations',
  CUSTOMER_SUCCESS = 'Customer Success',
  SECURITY = 'Security',
  OTHER = 'Other',
}

export const ROLE_FAMILY_ADJACENCY: Record<string, string[]> = {
  [RoleFamily.DATA]: [RoleFamily.ENGINEERING],
  [RoleFamily.ENGINEERING]: [RoleFamily.DATA],
  [RoleFamily.PRODUCT]: [RoleFamily.DESIGN],
  [RoleFamily.DESIGN]: [RoleFamily.PRODUCT],
  [RoleFamily.MARKETING]: [RoleFamily.SALES],
  [RoleFamily.SALES]: [RoleFamily.MARKETING],
};

export const ONBOARDING_STEP_IDS = [1, 2, 3, 4, 5, 6, 7] as const;
export type OnboardingStepId = (typeof ONBOARDING_STEP_IDS)[number];

export const ONBOARDING_STEP_TITLES: Record<OnboardingStepId, string> = {
  1: 'Studies',
  2: 'Industry and interests',
  3: 'Current skills',
  4: 'Soft skills',
  5: 'Career direction',
  6: 'Goals and timeline',
  7: 'Review and generate',
};
