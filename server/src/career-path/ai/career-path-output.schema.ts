import { z } from 'zod';

export const careerPathOutputSchema = z.object({
  summary: z.string().max(400),
  primaryTarget: z.object({
    jobId: z.string(),
    title: z.string(),
    whyItFits: z.string().max(300),
    fitScore: z.number().min(0).max(100),
    estimatedMonthsToReady: z.number(),
  }),
  alternatives: z
    .array(
      z.object({
        jobId: z.string(),
        title: z.string(),
        tradeOff: z.string(),
        isAdjacent: z.boolean(),
      }),
    )
    .max(2),
  skillGaps: z.array(
    z.object({
      skillId: z.string(),
      name: z.string(),
      currentLevel: z.number().min(0).max(5),
      requiredLevel: z.number().min(1).max(5),
      priority: z.enum(['HIGH', 'MEDIUM', 'LOW']),
    }),
  ),
  strengths: z
    .array(
      z.object({
        skillId: z.string(),
        name: z.string(),
        note: z.string(),
      }),
    )
    .max(5),
  phases: z
    .array(
      z.object({
        order: z.number(),
        title: z.string(),
        startMonth: z.number(),
        endMonth: z.number(),
        focus: z.string(),
        skillsToBuild: z.array(
          z.object({
            skillId: z.string(),
            targetLevel: z.number().min(1).max(5),
          }),
        ),
        courses: z.array(
          z.object({
            courseId: z.string(),
            reason: z.string(),
            estimatedHours: z.number(),
          }),
        ),
        milestone: z.object({ description: z.string(), evidence: z.string() }),
        successSignal: z.string(),
      }),
    )
    .min(2)
    .max(5),
  progressionLadder: z.array(
    z.object({
      jobId: z.string(),
      title: z.string(),
      typicalMonthsFromStart: z.number(),
      promotionCriteria: z.array(z.string()),
    }),
  ),
  weeklyPlan: z.object({
    hoursPerWeek: z.number(),
    suggestedSplit: z.array(
      z.object({ activity: z.string(), hours: z.number() }),
    ),
  }),
  considerations: z.array(z.string()).max(5),
  nextSteps: z.array(z.string()).length(3),
});

export type CareerPathOutput = z.infer<typeof careerPathOutputSchema>;
