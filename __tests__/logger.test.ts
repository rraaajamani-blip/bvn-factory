/**
 * Tests for logger utility.
 */

import { getLogger, initializeLogger } from '@utils/logger';
import { LogLevel } from '@types/common.types';

describe('Logger', () => {
  beforeEach(() => {
    // Clear console mocks before each test
    jest.clearAllMocks();
  });

  it('should create logger instance', () => {
    const logger = getLogger('TestModule');
    expect(logger).toBeDefined();
  });

  it('should log at different levels', () => {
    const logger = getLogger('TestModule');

    logger.debug('debug message');
    logger.info('info message');
    logger.warn('warn message');
    logger.error('error message', new Error('test error'));
    logger.fatal('fatal message', new Error('fatal error'));

    const logs = logger.getLogs();
    expect(logs.length).toBeGreaterThanOrEqual(5);
  });

  it('should filter logs by level', () => {
    const logger = getLogger('TestModule');

    logger.debug('debug');
    logger.info('info');
    logger.error('error');

    const errorLogs = logger.getLogsByLevel(LogLevel.ERROR);
    expect(errorLogs.length).toBeGreaterThanOrEqual(1);
    expect(errorLogs[0].level).toBe(LogLevel.ERROR);
  });

  it('should initialize global logger', () => {
    const logger = initializeLogger(LogLevel.INFO);
    expect(logger).toBeDefined();
  });

  it('should clear logs', () => {
    const logger = getLogger('TestModule');
    logger.info('test');
    logger.clearLogs();
    expect(logger.getLogs().length).toBe(0);
  });

  it('should include error details in error logs', () => {
    const logger = getLogger('TestModule');
    const testError = new Error('test error message');
    logger.error('error occurred', testError);

    const logs = logger.getLogs();
    const errorLog = logs.find((l) => l.level === LogLevel.ERROR);
    expect(errorLog?.error?.message).toBe('test error message');
  });

  it('should include custom data in logs', () => {
    const logger = getLogger('TestModule');
    const customData = { userId: 123, action: 'test' };
    logger.info('user action', customData);

    const logs = logger.getLogs();
    const infoLog = logs.find((l) => l.level === LogLevel.INFO);
    expect(infoLog?.data).toEqual(customData);
  });
});
