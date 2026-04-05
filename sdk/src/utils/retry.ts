export interface RetryOptions {
  retries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  shouldRetry?: (error: unknown) => boolean;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions,
): Promise<T> {
  let attempt = 0;

  while (true) {
    try {
      return await fn();
    } catch (error) {
      attempt += 1;
      const canRetryByAttempts = attempt <= options.retries;
      const canRetryByPredicate = options.shouldRetry
        ? options.shouldRetry(error)
        : true;

      if (!canRetryByAttempts || !canRetryByPredicate) {
        throw error;
      }

      const delay = Math.min(
        options.baseDelayMs * 2 ** (attempt - 1),
        options.maxDelayMs,
      );
      await sleep(delay);
    }
  }
}
