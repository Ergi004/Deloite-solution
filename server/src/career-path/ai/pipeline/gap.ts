import {
  CandidateCourse,
  CandidateJob,
  CandidateJobSkillGap,
  FilterResult,
  StudentContext,
} from './types';

function skillLevel(student: StudentContext, skillId: string): number {
  return student.skills.find((s) => s.skillId === skillId)?.level ?? 0;
}

export function computeFitAndGaps(
  student: StudentContext,
  filterResult: FilterResult,
): {
  candidateJobs: CandidateJob[];
  estimatedHoursByJob: Record<string, number>;
} {
  const estimatedHoursByJob: Record<string, number> = {};

  const candidateJobs: CandidateJob[] = filterResult.candidateJobs.map(
    (job) => {
      let coverage = 0;
      let totalWeight = 0;
      const gaps: CandidateJobSkillGap[] = [];

      for (const req of job.requiredSkills) {
        const current = skillLevel(student, req.skillId);
        coverage += Math.min(current / req.minLevel, 1) * req.weight;
        totalWeight += req.weight;
        if (current < req.minLevel) {
          gaps.push({
            skillId: req.skillId,
            name: req.name,
            currentLevel: current,
            requiredLevel: req.minLevel,
            weight: req.weight,
          });
        }
      }

      const fitScore =
        totalWeight > 0 ? Math.round((coverage / totalWeight) * 100) : 100;
      gaps.sort((a, b) => b.weight - a.weight);

      estimatedHoursByJob[job.id] = estimateHoursToCloseGaps(
        gaps,
        filterResult.candidateCourses,
      );

      return {
        id: job.id,
        title: job.title,
        roleFamily: job.roleFamily,
        industry: job.industry,
        seniority: job.seniority,
        isAdjacent: job.isAdjacent,
        fitScore,
        gaps,
        requiredSkillIds: job.requiredSkills.map((s) => s.skillId),
        promotionCriteria: job.promotionCriteria,
        monthsToProductivity: job.monthsToProductivity,
      };
    },
  );

  candidateJobs.sort((a, b) => b.fitScore - a.fitScore);

  return { candidateJobs, estimatedHoursByJob };
}

function estimateHoursToCloseGaps(
  gaps: { skillId: string; requiredLevel: number }[],
  courses: CandidateCourse[],
): number {
  let hours = 0;
  for (const gap of gaps) {
    const coveringCourses = courses
      .filter((c) => c.skillsGained.some((sg) => sg.skillId === gap.skillId))
      .sort((a, b) => a.estimatedHours - b.estimatedHours);
    if (coveringCourses.length > 0) {
      hours += coveringCourses[0].estimatedHours;
    }
  }
  return hours;
}
