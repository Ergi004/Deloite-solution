import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';

export interface GeminiGenerateRequest {
  systemInstruction: string;
  userMessage: string;
  temperature: number;
}

export interface GeminiGenerateResult {
  text: string;
  tokensIn: number | null;
  tokensOut: number | null;
  model: string;
}

/** Thin, mockable wrapper around the Gemini SDK. Returns null when AI generation isn't available. */
@Injectable()
export class GeminiClient {
  private readonly logger = new Logger(GeminiClient.name);
  private readonly client: GoogleGenAI | null;
  private readonly model: string;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('GEMINI_API_KEY');
    this.model = this.config.get<string>('GEMINI_MODEL')!;
    this.client = apiKey ? new GoogleGenAI({ apiKey }) : null;
  }

  isEnabled(): boolean {
    return this.client !== null;
  }

  async generate(
    request: GeminiGenerateRequest,
  ): Promise<GeminiGenerateResult | null> {
    if (!this.client) {
      return null;
    }

    const attempt = async (): Promise<GeminiGenerateResult> => {
      const response = await this.client!.models.generateContent({
        model: this.model,
        contents: request.userMessage,
        config: {
          systemInstruction: request.systemInstruction,
          temperature: request.temperature,
          responseMimeType: 'application/json',
        },
      });
      const text = response.text ?? '';
      return {
        text,
        tokensIn: response.usageMetadata?.promptTokenCount ?? null,
        tokensOut: response.usageMetadata?.candidatesTokenCount ?? null,
        model: this.model,
      };
    };

    const maxRetries = 2;
    let lastError: unknown;
    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await Promise.race([
          attempt(),
          new Promise<never>((_, reject) =>
            setTimeout(
              () => reject(new Error('Gemini request timed out')),
              60_000,
            ),
          ),
        ]);
      } catch (error) {
        lastError = error;
        this.logger.warn(
          `Gemini generation attempt ${i + 1} failed: ${(error as Error).message}`,
        );
      }
    }
    this.logger.error(
      `Gemini generation failed after retries: ${(lastError as Error)?.message}`,
    );
    return null;
  }
}
