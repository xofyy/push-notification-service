import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface RetryOptions {
  maxAttempts: number;
  baseDelay: number; // in milliseconds
  maxDelay: number; // in milliseconds
  backoffMultiplier: number;
  jitter: boolean;
}

export interface RetryResult<T> {
  success: boolean;
  result?: T;
  error?: Error;
  attempts: number;
  totalDuration: number;
}

export class RetryableError extends Error {
  constructor(
    message: string,
    public readonly shouldRetry: boolean = true,
    public readonly retryAfter?: number,
  ) {
    super(message);
    this.name = 'RetryableError';
  }
}

@Injectable()
export class RetryService {
  private readonly logger = new Logger(RetryService.name);

  constructor(private readonly configService: ConfigService) {}

  async executeWithRetry<T>(
    operation: () => Promise<T>,
    options: Partial<RetryOptions> = {},
  ): Promise<RetryResult<T>> {
    const config: RetryOptions = {
      maxAttempts: options.maxAttempts ?? 3,
      baseDelay: options.baseDelay ?? 1000,
      maxDelay: options.maxDelay ?? 30000,
      backoffMultiplier: options.backoffMultiplier ?? 2,
      jitter: options.jitter ?? true,
    };

    const startTime = Date.now();
    let lastError: Error = new Error('No attempts made');

    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
      try {
        this.logger.debug(`Attempt ${attempt}/${config.maxAttempts}`);
        const result = await operation();
        const totalDuration = Date.now() - startTime;

        this.logger.debug(
          `Operation succeeded on attempt ${attempt} (${totalDuration}ms)`,
        );

        return {
          success: true,
          result,
          attempts: attempt,
          totalDuration,
        };
      } catch (error) {
        lastError = error as Error;
        const errorObj =
          error instanceof Error ? error : new Error(String(error));

        this.logger.warn(
          `Attempt ${attempt} failed: ${errorObj.message}`,
          errorObj.stack,
        );

        // Check if error is retryable
        if (error instanceof RetryableError && !error.shouldRetry) {
          this.logger.warn('Error is not retryable, stopping retry attempts');
          break;
        }

        // If this is the last attempt, don't wait
        if (attempt === config.maxAttempts) {
          break;
        }

        // Calculate delay with exponential backoff
        let delay =
          config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1);
        delay = Math.min(delay, config.maxDelay);

        // Add jitter to prevent thundering herd
        if (config.jitter) {
          delay = delay * (0.5 + Math.random() * 0.5);
        }

        // Check if error specifies a retry-after delay
        if (error instanceof RetryableError && error.retryAfter) {
          delay = Math.max(delay, error.retryAfter * 1000);
        }

        this.logger.debug(`Waiting ${delay}ms before next attempt`);
        await this.sleep(delay);
      }
    }

    const totalDuration = Date.now() - startTime;

    this.logger.error(
      `Operation failed after ${config.maxAttempts} attempts (${totalDuration}ms)`,
      lastError.stack,
    );

    return {
      success: false,
      error: lastError,
      attempts: config.maxAttempts,
      totalDuration,
    };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
