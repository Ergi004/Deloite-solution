import { GeminiClient } from '../gemini.client';
import { CAREER_PATH_SYSTEM_PROMPT } from '../prompts/career-path.v1';
import {
  CandidateJob,
  FilterResult,
  GenerationConstraints,
  StudentContext,
} from './types';

export interface GenerateInput {
  student: StudentContext;
  candidateJobs: CandidateJob[];
  progressionLadders: FilterResult['progressionLadders'];
  candidateCourses: FilterResult['candidateCourses'];
  constraints: GenerationConstraints;
  repairErrors?: string[];
}

export interface GenerateOutput {
  raw: unknown;
  tokensIn: number | null;
  tokensOut: number | null;
  model: string;
}

export async function generateWithAi(
  geminiClient: GeminiClient,
  input: GenerateInput,
): Promise<GenerateOutput | null> {
  if (!geminiClient.isEnabled()) {
    return null;
  }

  const userMessage = JSON.stringify({
    student: input.student,
    candidateJobs: input.candidateJobs,
    progressionLadders: input.progressionLadders,
    candidateCourses: input.candidateCourses,
    constraints: input.constraints,
    ...(input.repairErrors
      ? {
          previousAttemptErrors: input.repairErrors,
          instruction:
            'Fix these validation errors and return the corrected JSON.',
        }
      : {}),
  });

  const result = await geminiClient.generate({
    systemInstruction: CAREER_PATH_SYSTEM_PROMPT,
    userMessage,
    temperature: 0.4,
  });

  if (!result) {
    return null;
  }

  try {
    const raw: unknown = JSON.parse(result.text);
    return {
      raw,
      tokensIn: result.tokensIn,
      tokensOut: result.tokensOut,
      model: result.model,
    };
  } catch {
    return null;
  }
}
