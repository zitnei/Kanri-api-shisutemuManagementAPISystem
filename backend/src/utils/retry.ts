export interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  retryableErrors?: string[];
  onRetry?: (attempt: number, error: Error) => void;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  initialDelay: 100,
  maxDelay: 5000,
  backoffFactor: 2,
  retryableErrors: [],
  onRetry: () => {},
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function calculateDelay(attempt: number, options: Required<RetryOptions>): number {
  const exponentialDelay = options.initialDelay * Math.pow(options.backoffFactor, attempt - 1);
  const jitter = Math.random() * 0.1 * exponentialDelay;
  return Math.min(exponentialDelay + jitter, options.maxDelay);
}

function isRetryableError(error: Error, retryableErrors: string[]): boolean {
  if (retryableErrors.length === 0) {
    // Default: retry on network/timeout errors
    const retryableCodes = ['ECONNRESET', 'ETIMEDOUT', 'ECONNREFUSED', 'ENOTFOUND'];
    const errorCode = (error as NodeJS.ErrnoException).code;
    return errorCode ? retryableCodes.includes(errorCode) : false;
  }
  const errorCode = (error as NodeJS.ErrnoException).code || '';
  return retryableErrors.includes(errorCode);
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const config = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error;

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === config.maxAttempts || !isRetryableError(lastError, config.retryableErrors)) {
        throw lastError;
      }

      config.onRetry(attempt, lastError);
      const delay = calculateDelay(attempt, config);
      await sleep(delay);
    }
  }

  throw lastError!;
}

export async function withTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number
): Promise<T> {
  return Promise.race([
    fn(),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs)
    ),
  ]);
}
