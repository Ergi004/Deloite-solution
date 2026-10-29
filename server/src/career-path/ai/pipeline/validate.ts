import {
  careerPathOutputSchema,
  CareerPathOutput,
} from '../career-path-output.schema';
import {
  CandidateCourse,
  CandidateJob,
  FilterResult,
  GenerationConstraints,
} from './types';

export interface ValidationContext {
  candidateJobs: CandidateJob[];
  candidateCourses: CandidateCourse[];
  progressionLadders: FilterResult['progressionLadders'];
  constraints: GenerationConstraints;
}

export type ValidationResult =
  { valid: true; data: CareerPathOutput } | { valid: false; errors: string[] };

const LEAK_PATTERNS = [
  /api[_\s-]?key/i,
  /system prompt/i,
  /ignore (all|previous) instructions/i,
];

export function validateCareerPathOutput(
  raw: unknown,
  ctx: ValidationContext,
): ValidationResult {
  const parsed = careerPathOutputSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      valid: false,
      errors: parsed.error.issues.map(
        (i) => `${i.path.join('.')}: ${i.message}`,
      ),
    };
  }
  const data = parsed.data;
  const errors: string[] = [];

  const jobIds = new Set(ctx.candidateJobs.map((j) => j.id));
  const ladderJobIds = new Set(ctx.progressionLadders.map((l) => l.jobId));
  const allKnownJobIds = new Set([...jobIds, ...ladderJobIds]);
  const courseIds = new Set(ctx.candidateCourses.map((c) => c.id));
  const skillIds = new Set([
    ...ctx.candidateJobs.flatMap((j) => j.requiredSkillIds),
    ...ctx.candidateCourses.flatMap((c) => c.skillIds),
  ]);

  const hasNonAdjacentCandidate = ctx.candidateJobs.some((j) => !j.isAdjacent);
  const primaryJob = ctx.candidateJobs.find(
    (j) => j.id === data.primaryTarget.jobId,
  );
  if (!primaryJob) {
    errors.push(
      `primaryTarget.jobId "${data.primaryTarget.jobId}" is not a candidate job`,
    );
  } else if (primaryJob.isAdjacent && hasNonAdjacentCandidate) {
    errors.push(
      'primaryTarget must be in the student industry/role family, not an adjacent one',
    );
  }

  for (const alt of data.alternatives) {
    if (!jobIds.has(alt.jobId)) {
      errors.push(`alternatives contains unknown jobId "${alt.jobId}"`);
    }
  }

  for (const gap of data.skillGaps) {
    if (!skillIds.has(gap.skillId)) {
      errors.push(`skillGaps contains unknown skillId "${gap.skillId}"`);
    }
  }

  for (const s of data.strengths) {
    if (!skillIds.has(s.skillId)) {
      errors.push(`strengths contains unknown skillId "${s.skillId}"`);
    }
  }

  for (const ladder of data.progressionLadder) {
    if (!allKnownJobIds.has(ladder.jobId)) {
      errors.push(`progressionLadder contains unknown jobId "${ladder.jobId}"`);
    }
  }

  const usedCourseIds = new Set<string>();
  const sortedPhases = [...data.phases].sort((a, b) => a.order - b.order);
  for (const phase of sortedPhases) {
    for (const skillToBuild of phase.skillsToBuild) {
      if (!skillIds.has(skillToBuild.skillId)) {
        errors.push(
          `phase "${phase.title}" references unknown skillId "${skillToBuild.skillId}"`,
        );
      }
    }
    for (const course of phase.courses) {
      if (!courseIds.has(course.courseId)) {
        errors.push(
          `phase "${phase.title}" references unknown courseId "${course.courseId}"`,
        );
      }
      if (usedCourseIds.has(course.courseId)) {
        errors.push(
          `course "${course.courseId}" is used in more than one phase`,
        );
      }
      usedCourseIds.add(course.courseId);
    }
  }

  for (let i = 0; i < sortedPhases.length - 1; i++) {
    if (sortedPhases[i].endMonth !== sortedPhases[i + 1].startMonth) {
      errors.push(
        'phases must be contiguous and non-overlapping, in chronological order',
      );
      break;
    }
  }
  if (sortedPhases.length > 0) {
    const first = sortedPhases[0];
    const last = sortedPhases[sortedPhases.length - 1];
    if (first.startMonth > 1) {
      errors.push('the first phase must start at month 0 or 1');
    }
    if (last.endMonth < ctx.constraints.horizonMonths) {
      errors.push(
        `phases must cover the full ${ctx.constraints.horizonMonths}-month horizon`,
      );
    }
  }

  const totalHours = [...usedCourseIds].reduce((sum, id) => {
    const course = ctx.candidateCourses.find((c) => c.id === id);
    return sum + (course?.estimatedHours ?? 0);
  }, 0);
  if (totalHours > ctx.constraints.maxTotalHours * 1.1) {
    errors.push(
      `total course hours (${totalHours}) exceed the budget (${ctx.constraints.maxTotalHours})`,
    );
  }

  const levelBySkillInPhaseOrder: Record<string, string[]> = {};
  for (const phase of sortedPhases) {
    for (const course of phase.courses) {
      const courseInfo = ctx.candidateCourses.find(
        (c) => c.id === course.courseId,
      );
      if (!courseInfo) continue;
      for (const skillId of courseInfo.skillIds) {
        levelBySkillInPhaseOrder[skillId] =
          levelBySkillInPhaseOrder[skillId] ?? [];
        levelBySkillInPhaseOrder[skillId].push(courseInfo.level);
      }
    }
  }
  for (const [skillId, levels] of Object.entries(levelBySkillInPhaseOrder)) {
    const advancedIndex = levels.indexOf('ADVANCED');
    const beginnerIndex = levels.indexOf('BEGINNER');
    if (
      advancedIndex !== -1 &&
      beginnerIndex !== -1 &&
      advancedIndex < beginnerIndex
    ) {
      errors.push(
        `skill "${skillId}" has an ADVANCED course scheduled before its BEGINNER course`,
      );
    }
  }

  const allText = JSON.stringify(data);
  for (const pattern of LEAK_PATTERNS) {
    if (pattern.test(allText)) {
      errors.push('output appears to leak sensitive internal information');
      break;
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }
  return { valid: true, data };
}
