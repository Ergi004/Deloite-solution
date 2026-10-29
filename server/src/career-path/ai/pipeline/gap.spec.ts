import { computeFitAndGaps } from './gap';
import { FilterResult, StudentContext } from './types';

const student: StudentContext = {
  roleFamily: 'Engineering',
  preferredIndustry: 'Software and IT Services',
  fieldOfStudy: null,
  degreeLevel: null,
  targetRole: null,
  targetLevel: null,
  targetHorizonYears: 2,
  weeklyLearningHours: 5,
  trackPreference: null,
  expectations: [],
  interests: [],
  skills: [
    { skillId: 'sql', name: 'SQL', level: 3 },
    { skillId: 'node', name: 'Node.js', level: 1 },
  ],
  softSkills: {},
  notableProjects: null,
  goalStatement: null,
};

const filterResult: FilterResult = {
  candidateJobs: [
    {
      id: 'job-full-fit',
      title: 'Fully met role',
      roleFamily: 'Engineering',
      industry: 'Software and IT Services',
      seniority: 'JUNIOR',
      isAdjacent: false,
      requiredSkills: [{ skillId: 'sql', name: 'SQL', minLevel: 2, weight: 5 }],
      promotionCriteria: [],
      monthsToProductivity: 3,
    },
    {
      id: 'job-partial-fit',
      title: 'Partially met role',
      roleFamily: 'Engineering',
      industry: 'Software and IT Services',
      seniority: 'JUNIOR',
      isAdjacent: false,
      requiredSkills: [
        { skillId: 'sql', name: 'SQL', minLevel: 2, weight: 3 },
        { skillId: 'node', name: 'Node.js', minLevel: 4, weight: 5 },
      ],
      promotionCriteria: [],
      monthsToProductivity: 4,
    },
  ],
  candidateCourses: [
    {
      id: 'course-node',
      title: 'Node.js Fundamentals',
      provider: 'Coursera',
      estimatedHours: 18,
      level: 'BEGINNER',
      format: 'VIDEO',
      skillIds: ['node'],
      skillsGained: [{ skillId: 'node', levelGained: 2 }],
    },
  ],
  progressionLadders: [],
};

describe('computeFitAndGaps', () => {
  it('gives 100% fit when all required skills are already met', () => {
    const { candidateJobs } = computeFitAndGaps(student, filterResult);
    const fullFit = candidateJobs.find((j) => j.id === 'job-full-fit')!;
    expect(fullFit.fitScore).toBe(100);
    expect(fullFit.gaps).toHaveLength(0);
  });

  it('computes a partial fit score and lists the unmet skill as a gap', () => {
    const { candidateJobs } = computeFitAndGaps(student, filterResult);
    const partialFit = candidateJobs.find((j) => j.id === 'job-partial-fit')!;
    // sql: min(3/2,1)*3=3; node: min(1/4,1)*5=1.25; total=4.25/8=53.125% -> rounds to 53
    expect(partialFit.fitScore).toBe(53);
    expect(partialFit.gaps).toHaveLength(1);
    expect(partialFit.gaps[0].skillId).toBe('node');
  });

  it('sorts candidate jobs by fit score descending', () => {
    const { candidateJobs } = computeFitAndGaps(student, filterResult);
    expect(candidateJobs[0].id).toBe('job-full-fit');
  });

  it('estimates learning hours from the cheapest course covering each gap', () => {
    const { estimatedHoursByJob } = computeFitAndGaps(student, filterResult);
    expect(estimatedHoursByJob['job-partial-fit']).toBe(18);
    expect(estimatedHoursByJob['job-full-fit']).toBe(0);
  });
});
