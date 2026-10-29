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

export enum JobStatus {
  DRAFT = 'DRAFT',
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  PLANNED = 'PLANNED',
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

export enum PathFeedback {
  UP = 'UP',
  DOWN = 'DOWN',
}

export enum TrackPreference {
  INDIVIDUAL_CONTRIBUTOR = 'INDIVIDUAL_CONTRIBUTOR',
  PEOPLE_LEADERSHIP = 'PEOPLE_LEADERSHIP',
  UNSURE = 'UNSURE',
}

export const ROLE_FAMILIES = [
  'Engineering',
  'Data',
  'Design',
  'Product',
  'Marketing',
  'Sales',
  'Finance',
  'HR',
  'Operations',
  'Customer Success',
  'Security',
  'Other',
] as const;

export const ONBOARDING_STEP_TITLES: Record<number, string> = {
  1: 'Studies',
  2: 'Industry and interests',
  3: 'Current skills',
  4: 'Soft skills',
  5: 'Career direction',
  6: 'Goals and timeline',
  7: 'Review and generate',
};
