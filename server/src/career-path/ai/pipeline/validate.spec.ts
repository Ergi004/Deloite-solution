import { validateCareerPathOutput, ValidationContext } from './validate';
import { CandidateJob, CandidateCourse } from './types';

const candidateJobs: CandidateJob[] = [
  {
    id: 'job-1',
    title: 'Junior Backend Developer',
    roleFamily: 'Engineering',
    industry: 'Software and IT Services',
    seniority: 'JUNIOR',
    isAdjacent: false,
    fitScore: 70,
    gaps: [
      {
        skillId: 'skill-sql',
        name: 'SQL',
        currentLevel: 1,
        requiredLevel: 3,
        weight: 4,
      },
    ],
    requiredSkillIds: ['skill-sql', 'skill-node'],
    promotionCriteria: ['Ships features independently'],
    monthsToProductivity: 4,
  },
];

const candidateCourses: CandidateCourse[] = [
  {
    id: 'course-1',
    title: 'SQL for Data Analysis',
    provider: 'Udemy',
    estimatedHours: 15,
    level: 'BEGINNER',
    format: 'VIDEO',
    skillIds: ['skill-sql'],
    skillsGained: [{ skillId: 'skill-sql', levelGained: 2 }],
  },
];

const ctx: ValidationContext = {
  candidateJobs,
  candidateCourses,
  progressionLadders: [],
  constraints: { horizonMonths: 12, weeklyHours: 5, maxTotalHours: 100 },
};

function validOutput() {
  return {
    summary: 'A path to becoming a backend developer.',
    primaryTarget: {
      jobId: 'job-1',
      title: 'Junior Backend Developer',
      whyItFits: 'Matches your skills.',
      fitScore: 70,
      estimatedMonthsToReady: 4,
    },
    alternatives: [],
    skillGaps: [
      {
        skillId: 'skill-sql',
        name: 'SQL',
        currentLevel: 1,
        requiredLevel: 3,
        priority: 'HIGH' as const,
      },
    ],
    strengths: [],
    phases: [
      {
        order: 1,
        title: 'Foundations',
        startMonth: 0,
        endMonth: 6,
        focus: 'SQL',
        skillsToBuild: [{ skillId: 'skill-sql', targetLevel: 3 }],
        courses: [
          { courseId: 'course-1', reason: 'Builds SQL', estimatedHours: 15 },
        ],
        milestone: { description: 'Ship a report', evidence: 'A dashboard' },
        successSignal: 'Manager approves',
      },
      {
        order: 2,
        title: 'Apply it',
        startMonth: 6,
        endMonth: 12,
        focus: 'Practice',
        skillsToBuild: [],
        courses: [],
        milestone: { description: 'Own a feature', evidence: 'A merged PR' },
        successSignal: 'Feature ships',
      },
    ],
    progressionLadder: [],
    weeklyPlan: {
      hoursPerWeek: 5,
      suggestedSplit: [{ activity: 'Courses', hours: 5 }],
    },
    considerations: [],
    nextSteps: [
      'Talk to your manager',
      'Start the course',
      'Block time this week',
    ],
  };
}

describe('validateCareerPathOutput', () => {
  it('accepts a well-formed output built entirely from candidate data', () => {
    const result = validateCareerPathOutput(validOutput(), ctx);
    expect(result.valid).toBe(true);
  });

  it('rejects an invented job id', () => {
    const output = validOutput();
    output.primaryTarget.jobId = 'job-does-not-exist';
    const result = validateCareerPathOutput(output, ctx);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.some((e) => e.includes('job-does-not-exist'))).toBe(
        true,
      );
    }
  });

  it('rejects an invented course id', () => {
    const output = validOutput();
    output.phases[0].courses[0].courseId = 'course-invented';
    const result = validateCareerPathOutput(output, ctx);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.some((e) => e.includes('course-invented'))).toBe(
        true,
      );
    }
  });

  it('rejects an invented skill id', () => {
    const output = validOutput();
    output.skillGaps[0].skillId = 'skill-invented';
    const result = validateCareerPathOutput(output, ctx);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.some((e) => e.includes('skill-invented'))).toBe(
        true,
      );
    }
  });

  it('rejects a budget that exceeds the allowed total hours', () => {
    const tightCtx: ValidationContext = {
      ...ctx,
      constraints: { ...ctx.constraints, maxTotalHours: 5 },
    };
    const result = validateCareerPathOutput(validOutput(), tightCtx);
    expect(result.valid).toBe(false);
  });

  it('rejects phases that do not cover the full horizon', () => {
    const output = validOutput();
    output.phases[1].endMonth = 8;
    const result = validateCareerPathOutput(output, ctx);
    expect(result.valid).toBe(false);
  });
});
