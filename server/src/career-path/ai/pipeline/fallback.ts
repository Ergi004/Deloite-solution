import { CareerPathOutput } from '../career-path-output.schema';
import {
  CandidateJob,
  FilterResult,
  GenerationConstraints,
  StudentContext,
} from './types';

function priorityFromWeight(weight: number): 'HIGH' | 'MEDIUM' | 'LOW' {
  if (weight >= 4) return 'HIGH';
  if (weight >= 2) return 'MEDIUM';
  return 'LOW';
}

function phaseCount(horizonMonths: number): number {
  if (horizonMonths <= 12) return 2;
  if (horizonMonths <= 24) return 3;
  if (horizonMonths <= 36) return 4;
  return 5;
}

export function buildFallbackCareerPath(
  student: StudentContext,
  candidateJobs: CandidateJob[],
  filterResult: FilterResult,
  constraints: GenerationConstraints,
): CareerPathOutput {
  const primary = candidateJobs.find((j) => !j.isAdjacent) ?? candidateJobs[0];
  const alternatives = candidateJobs
    .filter((j) => j.id !== primary.id)
    .slice(0, 2);

  const topGaps = [...primary.gaps]
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 8);
  const strengths = student.skills
    .filter((s) => primary.requiredSkillIds.includes(s.skillId))
    .filter((s) => {
      const req = filterResult.candidateJobs
        .find((j) => j.id === primary.id)
        ?.requiredSkills.find((r) => r.skillId === s.skillId);
      return req ? s.level >= req.minLevel : false;
    })
    .sort((a, b) => b.level - a.level)
    .slice(0, 5)
    .map((s) => ({
      skillId: s.skillId,
      name: s.name,
      note: `Already at level ${s.level}/5`,
    }));

  const numPhases = phaseCount(constraints.horizonMonths);
  const phaseLength = Math.floor(constraints.horizonMonths / numPhases);

  const usedCourseIds = new Set<string>();
  let hoursSoFar = 0;
  const gapsByPhase: (typeof topGaps)[] = Array.from(
    { length: numPhases },
    () => [],
  );
  topGaps.forEach((gap, i) => {
    gapsByPhase[i % numPhases].push(gap);
  });

  const phases: CareerPathOutput['phases'] = [];
  for (let i = 0; i < numPhases; i++) {
    const startMonth = i * phaseLength;
    const endMonth =
      i === numPhases - 1 ? constraints.horizonMonths : (i + 1) * phaseLength;
    const phaseGaps = gapsByPhase[i];

    const courses: CareerPathOutput['phases'][number]['courses'] = [];
    for (const gap of phaseGaps) {
      const candidates = filterResult.candidateCourses
        .filter(
          (c) => c.skillIds.includes(gap.skillId) && !usedCourseIds.has(c.id),
        )
        .sort((a, b) => a.estimatedHours - b.estimatedHours);
      const course = candidates[0];
      if (
        course &&
        hoursSoFar + course.estimatedHours <= constraints.maxTotalHours
      ) {
        usedCourseIds.add(course.id);
        hoursSoFar += course.estimatedHours;
        courses.push({
          courseId: course.id,
          reason: `Builds "${gap.name}" toward the level this role needs`,
          estimatedHours: course.estimatedHours,
        });
      }
    }

    phases.push({
      order: i + 1,
      title:
        phaseGaps.length > 0
          ? `Strengthen ${phaseGaps[0].name} and related skills`
          : `Consolidate and apply what you've learned`,
      startMonth,
      endMonth,
      focus:
        phaseGaps.map((g) => g.name).join(', ') ||
        'Applying skills on real work',
      skillsToBuild: phaseGaps.map((g) => ({
        skillId: g.skillId,
        targetLevel: g.requiredLevel,
      })),
      courses,
      milestone: {
        description: `Deliver a piece of work that demonstrates ${phaseGaps[0]?.name ?? 'your progress'}`,
        evidence:
          'A reviewable artifact (document, code, dashboard, or presentation) shared with your manager',
      },
      successSignal: 'Your manager confirms you can work on this independently',
    });
  }

  const hoursPerWeek = student.weeklyLearningHours;
  const courseHours = Math.round(hoursPerWeek * 0.6);
  const projectHours = Math.round(hoursPerWeek * 0.3);
  const mentoringHours = Math.max(hoursPerWeek - courseHours - projectHours, 0);

  const considerations: string[] = [];
  if (primary.isAdjacent) {
    considerations.push(
      `No open role matched your exact industry/role family yet, so this path points to the closest related role, "${primary.title}".`,
    );
  }
  if (
    constraints.horizonMonths <= 12 &&
    /senior|lead/i.test(student.targetLevel ?? '')
  ) {
    considerations.push(
      'Reaching a senior or lead level in one year is unlikely; this path targets a realistic next step within that time.',
    );
  }

  return {
    summary: `A step-by-step path toward ${primary.title} at your current company, built from your skills and goals.`,
    primaryTarget: {
      jobId: primary.id,
      title: primary.title,
      whyItFits: `This role matches your ${student.roleFamily} background and current skill level (${primary.fitScore}% fit).`,
      fitScore: primary.fitScore,
      estimatedMonthsToReady: Math.max(
        primary.monthsToProductivity,
        phaseLength,
      ),
    },
    alternatives: alternatives.map((alt) => ({
      jobId: alt.id,
      title: alt.title,
      tradeOff: alt.isAdjacent
        ? 'A related role in an adjacent discipline'
        : 'A similar role with a different skill emphasis',
      isAdjacent: alt.isAdjacent,
    })),
    skillGaps: topGaps.map((g) => ({
      skillId: g.skillId,
      name: g.name,
      currentLevel: g.currentLevel,
      requiredLevel: g.requiredLevel,
      priority: priorityFromWeight(g.weight),
    })),
    strengths,
    phases,
    progressionLadder: filterResult.progressionLadders,
    weeklyPlan: {
      hoursPerWeek,
      suggestedSplit: [
        { activity: 'Courses & structured learning', hours: courseHours },
        { activity: 'Hands-on project work', hours: projectHours },
        { activity: 'Mentoring & feedback', hours: mentoringHours },
      ],
    },
    considerations,
    nextSteps: [
      'Share this path with your manager and agree on your first milestone',
      'Block time on your calendar each week for the learning hours above',
      'Start the first course or activity in phase 1 this week',
    ],
  };
}
