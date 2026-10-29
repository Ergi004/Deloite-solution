import { buildFallbackCareerPath } from './fallback';
import { validateCareerPathOutput } from './validate';
import { filterCandidates } from './filter';
import { computeFitAndGaps } from './gap';
import { GenerationConstraints, StudentContext } from './types';
import { Job } from '../../../jobs/entities/job.entity';
import { JobSkill } from '../../../jobs/entities/job-skill.entity';
import { Course } from '../../../courses/entities/course.entity';
import { CourseSkill } from '../../../courses/entities/course-skill.entity';

const student: StudentContext = {
  roleFamily: 'Engineering',
  preferredIndustry: 'Software and IT Services',
  fieldOfStudy: 'Computer Science',
  degreeLevel: 'Bachelor',
  targetRole: 'Backend Developer',
  targetLevel: 'Mid',
  targetHorizonYears: 2,
  weeklyLearningHours: 6,
  trackPreference: 'INDIVIDUAL_CONTRIBUTOR',
  expectations: [],
  interests: [],
  skills: [
    { skillId: 'js', name: 'JavaScript', level: 3 },
    { skillId: 'node', name: 'Node.js', level: 1 },
  ],
  softSkills: { communication: 4 },
  notableProjects: null,
  goalStatement: 'Become a confident backend developer.',
};

const jobs: Job[] = [
  {
    id: 'job-1',
    companyId: 'c',
    code: 'ENG-BE-JR',
    title: 'Junior Backend Developer',
    department: 'Engineering',
    roleFamily: 'Engineering',
    industry: 'Software and IT Services',
    seniority: 'JUNIOR',
    status: 'OPEN',
    monthsToProductivity: 4,
    promotionCriteria: ['Ships features independently'],
  } as Job,
];

const jobSkills: JobSkill[] = [
  {
    jobId: 'job-1',
    skillId: 'js',
    minLevel: 2,
    weight: 4,
    isRequired: true,
    skill: { name: 'JavaScript' },
  } as unknown as JobSkill,
  {
    jobId: 'job-1',
    skillId: 'node',
    minLevel: 3,
    weight: 5,
    isRequired: true,
    skill: { name: 'Node.js' },
  } as unknown as JobSkill,
  {
    jobId: 'job-1',
    skillId: 'sql',
    minLevel: 2,
    weight: 3,
    isRequired: true,
    skill: { name: 'SQL' },
  } as unknown as JobSkill,
];

const courses: Course[] = [
  {
    id: 'course-node',
    companyId: null,
    estimatedHours: 18,
    level: 'BEGINNER',
  } as Course,
  {
    id: 'course-sql',
    companyId: null,
    estimatedHours: 15,
    level: 'BEGINNER',
  } as Course,
];

const courseSkills: CourseSkill[] = [
  { courseId: 'course-node', skillId: 'node', levelGained: 3 } as CourseSkill,
  { courseId: 'course-sql', skillId: 'sql', levelGained: 2 } as CourseSkill,
];

describe('buildFallbackCareerPath', () => {
  it('produces output that passes strict validation against the same candidate sets', () => {
    const filterResult = filterCandidates(student, {
      jobs,
      jobSkills,
      progressions: [],
      courses,
      courseSkills,
    });
    expect(filterResult).not.toBeNull();
    const { candidateJobs } = computeFitAndGaps(student, filterResult!);

    const constraints: GenerationConstraints = {
      horizonMonths: 24,
      weeklyHours: 6,
      maxTotalHours: Math.round(24 * 4.3 * 6 * 0.8),
    };

    const output = buildFallbackCareerPath(
      student,
      candidateJobs,
      filterResult!,
      constraints,
    );

    const validation = validateCareerPathOutput(output, {
      candidateJobs,
      candidateCourses: filterResult!.candidateCourses,
      progressionLadders: filterResult!.progressionLadders,
      constraints,
    });

    expect(validation.valid).toBe(true);
    expect(output.primaryTarget.jobId).toBe('job-1');
    expect(output.nextSteps).toHaveLength(3);
  });
});
