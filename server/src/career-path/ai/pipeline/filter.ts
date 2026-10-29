import { Job } from '../../../jobs/entities/job.entity';
import { JobSkill } from '../../../jobs/entities/job-skill.entity';
import { JobProgression } from '../../../jobs/entities/job-progression.entity';
import { Course } from '../../../courses/entities/course.entity';
import { CourseSkill } from '../../../courses/entities/course-skill.entity';
import { ROLE_FAMILY_ADJACENCY } from '../../../types/enums';
import { StudentContext } from './types';
import {
  CandidateCourse,
  FilterResult,
  ProgressionLadderEntry,
  SelectedJob,
} from './types';

export interface FilterInput {
  jobs: Job[];
  jobSkills: JobSkill[];
  progressions: JobProgression[];
  courses: Course[];
  courseSkills: CourseSkill[];
}

/** Returns null when there are zero candidate jobs for the student's industry/role family. */
export function filterCandidates(
  student: StudentContext,
  input: FilterInput,
): FilterResult | null {
  const sameFamilyJobs = input.jobs.filter(
    (job) =>
      job.industry === student.preferredIndustry &&
      job.roleFamily === student.roleFamily,
  );

  let candidates: { job: Job; isAdjacent: boolean }[] = sameFamilyJobs.map(
    (job) => ({
      job,
      isAdjacent: false,
    }),
  );

  if (candidates.length < 2) {
    const adjacentFamilies = ROLE_FAMILY_ADJACENCY[student.roleFamily] ?? [];
    const adjacentJobs = input.jobs.filter(
      (job) =>
        job.industry === student.preferredIndustry &&
        adjacentFamilies.includes(job.roleFamily),
    );
    candidates = [
      ...candidates,
      ...adjacentJobs.map((job) => ({ job, isAdjacent: true })),
    ];
  }

  if (candidates.length === 0) {
    return null;
  }

  const candidateJobIds = new Set(candidates.map((c) => c.job.id));

  const candidateJobs: SelectedJob[] = candidates.map(({ job, isAdjacent }) => {
    const requiredSkills = input.jobSkills
      .filter((js) => js.jobId === job.id && js.isRequired)
      .map((js) => ({
        skillId: js.skillId,
        name: js.skill?.name ?? js.skillId,
        minLevel: js.minLevel,
        weight: js.weight,
      }));
    return {
      id: job.id,
      title: job.title,
      roleFamily: job.roleFamily,
      industry: job.industry,
      seniority: job.seniority,
      isAdjacent,
      requiredSkills,
      promotionCriteria: job.promotionCriteria,
      monthsToProductivity: job.monthsToProductivity,
    };
  });

  const requiredSkillIds = new Set(
    candidateJobs.flatMap((j) => j.requiredSkills.map((s) => s.skillId)),
  );

  const candidateCourses: CandidateCourse[] = [];
  for (const course of input.courses) {
    const skills = input.courseSkills.filter((cs) => cs.courseId === course.id);
    const relevantSkills = skills.filter((s) =>
      requiredSkillIds.has(s.skillId),
    );
    if (relevantSkills.length === 0) continue;
    candidateCourses.push({
      id: course.id,
      title: course.title,
      provider: course.provider,
      estimatedHours: course.estimatedHours,
      level: course.level,
      format: course.format,
      skillIds: relevantSkills.map((s) => s.skillId),
      skillsGained: relevantSkills.map((s) => ({
        skillId: s.skillId,
        levelGained: s.levelGained,
      })),
    });
  }

  const progressionLadders: ProgressionLadderEntry[] = input.progressions
    .filter((p) => candidateJobIds.has(p.fromJobId))
    .map((p) => ({
      jobId: p.toJobId,
      title: p.toJob?.title ?? p.toJobId,
      typicalMonthsFromStart: p.typicalMonths,
      promotionCriteria: p.toJob?.promotionCriteria ?? [],
    }));

  return { candidateJobs, candidateCourses, progressionLadders };
}
