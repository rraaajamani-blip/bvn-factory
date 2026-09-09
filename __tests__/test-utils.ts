/**
 * Test utilities and helpers.
 */

import { Result } from '@types/common.types';

/**
 * Assert that a result succeeded.
 */
export function assertSuccess<T>(
  result: Result<T>,
  message?: string
): T {
  if (!result.success) {
    throw new Error(message || `Expected success but got error: ${result.error}`);
  }
  return result.data;
}

/**
 * Assert that a result failed.
 */
export function assertError<T>(
  result: Result<T>,
  message?: string
): string {
  if (result.success) {
    throw new Error(message || 'Expected error but result succeeded');
  }
  return result.error;
}

/**
 * Create a mock logger for testing.
 */
export function createMockLogger() {
  const logs: Array<{ level: string; message: string; data?: unknown }> = [];

  return {
    debug: (message: string, data?: unknown) => logs.push({ level: 'DEBUG', message, data }),
    info: (message: string, data?: unknown) => logs.push({ level: 'INFO', message, data }),
    warn: (message: string, data?: unknown) => logs.push({ level: 'WARN', message, data }),
    error: (message: string, error?: Error, data?: unknown) =>
      logs.push({ level: 'ERROR', message, data: { error, ...data } }),
    fatal: (message: string, error?: Error, data?: unknown) =>
      logs.push({ level: 'FATAL', message, data: { error, ...data } }),
    getLogs: () => [...logs],
    clear: () => logs.splice(0),
  };
}

/**
 * Delay execution for testing async code.
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
