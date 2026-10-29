import { filterCandidates } from './filter';
import { StudentContext } from './types';
import { Job } from '../../../jobs/entities/job.entity';
import { JobSkill } from '../../../jobs/entities/job-skill.entity';
import { JobProgression } from '../../../jobs/entities/job-progression.entity';

function makeJob(overrides: Partial<Job>): Job {
  return {
    id: 'job',
    companyId: 'company',
    code: 'CODE',
    title: 'Title',
    department: 'Dept',
    roleFamily: 'Engineering',
    industry: 'Software and IT Services',
    seniority: 'JUNIOR',
    employmentType: 'Full-time',
    location: 'Tirana',
    workMode: 'HYBRID',
    salaryMin: null,
    salaryMax: null,
    salaryCurrency: null,
    openings: 1,
    status: 'OPEN',
    targetStartDate: null,
    closingDate: null,
    summary: '',
    responsibilities: [],
    niceToHaveSkills: null,
    toolsAndTech: [],
    educationRequirement: '',
    minYearsExperience: '0',
    languages: [],
    softSkillRequirements: [],
    monthsToProductivity: 3,
    promotionCriteria: [],
    reportsTo: null,
    teamSize: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as Job;
}

const baseStudent: StudentContext = {
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
  skills: [],
  softSkills: {},
  notableProjects: null,
  goalStatement: null,
};

describe('filterCandidates', () => {
  it('returns null when there are zero jobs in the industry/role family and no adjacent family', () => {
    const result = filterCandidates(
      { ...baseStudent, roleFamily: 'Other' },
      {
        jobs: [makeJob({ id: 'j1' })],
        jobSkills: [],
        progressions: [],
        courses: [],
        courseSkills: [],
      },
    );
    expect(result).toBeNull();
  });

  it('matches jobs in the exact industry and role family, marked as not adjacent', () => {
    const result = filterCandidates(baseStudent, {
      jobs: [
        makeJob({
          id: 'j1',
          roleFamily: 'Engineering',
          industry: 'Software and IT Services',
        }),
      ],
      jobSkills: [],
      progressions: [],
      courses: [],
      courseSkills: [],
    });
    expect(result?.candidateJobs).toHaveLength(1);
    expect(result?.candidateJobs[0].isAdjacent).toBe(false);
  });

  it('never includes a job from a different industry even if the role family matches', () => {
    const result = filterCandidates(baseStudent, {
      jobs: [
        makeJob({
          id: 'j1',
          roleFamily: 'Engineering',
          industry: 'Finance and Accounting',
        }),
      ],
      jobSkills: [],
      progressions: [],
      courses: [],
      courseSkills: [],
    });
    expect(result).toBeNull();
  });

  it('falls back to an adjacent role family only when fewer than 2 exact matches exist', () => {
    const result = filterCandidates(
      { ...baseStudent, roleFamily: 'Data' },
      {
        jobs: [
          makeJob({
            id: 'j1',
            roleFamily: 'Engineering',
            industry: 'Software and IT Services',
          }),
        ],
        jobSkills: [],
        progressions: [],
        courses: [],
        courseSkills: [],
      },
    );
    expect(result?.candidateJobs).toHaveLength(1);
    expect(result?.candidateJobs[0].isAdjacent).toBe(true);
  });

  it('does not fall back to adjacent families when 2+ exact matches already exist', () => {
    const result = filterCandidates(
      { ...baseStudent, roleFamily: 'Data' },
      {
        jobs: [
          makeJob({
            id: 'j1',
            roleFamily: 'Data',
            industry: 'Software and IT Services',
          }),
          makeJob({
            id: 'j2',
            roleFamily: 'Data',
            industry: 'Software and IT Services',
          }),
          makeJob({
            id: 'j3',
            roleFamily: 'Engineering',
            industry: 'Software and IT Services',
          }),
        ],
        jobSkills: [],
        progressions: [],
        courses: [],
        courseSkills: [],
      },
    );
    expect(result?.candidateJobs).toHaveLength(2);
    expect(result?.candidateJobs.every((j) => !j.isAdjacent)).toBe(true);
  });

  it('only includes progressions that start from a candidate job', () => {
    const result = filterCandidates(baseStudent, {
      jobs: [makeJob({ id: 'j1' })],
      jobSkills: [],
      progressions: [
        {
          fromJobId: 'j1',
          toJobId: 'j2',
          typicalMonths: 12,
          notes: null,
        } as unknown as JobProgression,
        {
          fromJobId: 'unrelated',
          toJobId: 'j3',
          typicalMonths: 12,
          notes: null,
        } as unknown as JobProgression,
      ],
      courses: [],
      courseSkills: [],
    });
    expect(result?.progressionLadders).toHaveLength(1);
    expect(result?.progressionLadders[0].jobId).toBe('j2');
  });

  it('only includes courses linked to a skill required by a candidate job', () => {
    const jobSkills = [
      {
        jobId: 'j1',
        skillId: 'sql',
        skill: { name: 'SQL' },
      } as unknown as JobSkill,
    ];
    const result = filterCandidates(baseStudent, {
      jobs: [makeJob({ id: 'j1' })],
      jobSkills: jobSkills.map((js) => ({
        ...js,
        isRequired: true,
        minLevel: 2,
        weight: 3,
      })),
      progressions: [],
      courses: [
        { id: 'c-relevant', companyId: null } as never,
        { id: 'c-irrelevant', companyId: null } as never,
      ],
      courseSkills: [
        { courseId: 'c-relevant', skillId: 'sql', levelGained: 2 } as never,
        {
          courseId: 'c-irrelevant',
          skillId: 'unrelated-skill',
          levelGained: 2,
        } as never,
      ],
    });
    expect(result?.candidateCourses.map((c) => c.id)).toEqual(['c-relevant']);
  });
});
