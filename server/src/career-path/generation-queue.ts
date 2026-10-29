import { Injectable, Logger } from '@nestjs/common';

/** Abstraction so the in-process queue can be swapped for BullMQ/Redis later without touching callers. */
export interface GenerationQueue {
  enqueue(job: () => Promise<void>): void;
}

@Injectable()
export class InProcessGenerationQueue implements GenerationQueue {
  private readonly logger = new Logger(InProcessGenerationQueue.name);

  enqueue(job: () => Promise<void>): void {
    void job().catch((error) => {
      this.logger.error(
        `Background generation job failed: ${(error as Error).message}`,
      );
    });
  }
}
