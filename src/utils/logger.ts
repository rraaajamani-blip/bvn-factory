/**
 * Logger service for application-wide logging.
 * Provides structured logging with multiple levels.
 */

import { LogLevel, LogEntry, createISOTimestamp, JSONValue } from '@bvn-types/common.types';

interface LoggerConfig {
  minLevel: LogLevel;
  enableConsole: boolean;
  enableStorage: boolean;
  maxStoredLogs: number;
}

const LOG_LEVEL_ORDER = {
  [LogLevel.DEBUG]: 0,
  [LogLevel.INFO]: 1,
  [LogLevel.WARN]: 2,
  [LogLevel.ERROR]: 3,
  [LogLevel.FATAL]: 4,
};

class Logger {
  public readonly config: LoggerConfig;
  private logs: LogEntry[] = [];
  private module: string;

  constructor(module: string, config: Partial<LoggerConfig> = {}) {
    this.module = module;
    this.config = {
      minLevel: LogLevel.DEBUG,
      enableConsole: true,
      enableStorage: true,
      maxStoredLogs: 1000,
      ...config,
    };
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVEL_ORDER[level] >= LOG_LEVEL_ORDER[this.config.minLevel];
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    data?: JSONValue,
    error?: Error
  ): LogEntry {
    return {
      timestamp: createISOTimestamp(),
      level,
      module: this.module,
      message,
      data,
      error: error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : undefined,
    };
  }

  private logToConsole(entry: LogEntry): void {
    if (!this.config.enableConsole) return;

    const prefix = `[${entry.timestamp}] [${entry.level}] [${entry.module}]`;
    const consoleMethod = this.getConsoleMethod(entry.level);

    if (entry.data) {
      consoleMethod(prefix, entry.message, entry.data);
    } else if (entry.error) {
      consoleMethod(prefix, entry.message, entry.error);
    } else {
      consoleMethod(prefix, entry.message);
    }
  }

  private getConsoleMethod(level: LogLevel): typeof console.log {
    switch (level) {
      case LogLevel.DEBUG:
        return console.debug;
      case LogLevel.INFO:
        return console.info;
      case LogLevel.WARN:
        return console.warn;
      case LogLevel.ERROR:
        return console.error;
      case LogLevel.FATAL:
        return console.error;
      default:
        return console.log;
    }
  }

  private storeLog(entry: LogEntry): void {
    if (!this.config.enableStorage) return;

    this.logs.push(entry);
    if (this.logs.length > this.config.maxStoredLogs) {
      this.logs = this.logs.slice(-this.config.maxStoredLogs);
    }
  }

  debug(message: string, data?: JSONValue): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;
    const entry = this.createLogEntry(LogLevel.DEBUG, message, data);
    this.logToConsole(entry);
    this.storeLog(entry);
  }

  info(message: string, data?: JSONValue): void {
    if (!this.shouldLog(LogLevel.INFO)) return;
    const entry = this.createLogEntry(LogLevel.INFO, message, data);
    this.logToConsole(entry);
    this.storeLog(entry);
  }

  warn(message: string, data?: JSONValue): void {
    if (!this.shouldLog(LogLevel.WARN)) return;
    const entry = this.createLogEntry(LogLevel.WARN, message, data);
    this.logToConsole(entry);
    this.storeLog(entry);
  }

  error(message: string, error?: Error, data?: JSONValue): void {
    if (!this.shouldLog(LogLevel.ERROR)) return;
    const entry = this.createLogEntry(LogLevel.ERROR, message, data, error);
    this.logToConsole(entry);
    this.storeLog(entry);
  }

  fatal(message: string, error?: Error, data?: JSONValue): void {
    if (!this.shouldLog(LogLevel.FATAL)) return;
    const entry = this.createLogEntry(LogLevel.FATAL, message, data, error);
    this.logToConsole(entry);
    this.storeLog(entry);
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter((log) => log.level === level);
  }

  clearLogs(): void {
    this.logs = [];
  }
}

// Global logger instance
let globalLogger: Logger | null = null;

export function initializeLogger(
  minLevel: LogLevel = LogLevel.DEBUG,
  config?: Partial<LoggerConfig>
): Logger {
  if (globalLogger) {
    return globalLogger;
  }

  globalLogger = new Logger('GLOBAL', { minLevel, ...config });
  return globalLogger;
}

export function getLogger(module: string): Logger {
  if (!globalLogger) {
    initializeLogger();
  }

  return new Logger(module, {
    minLevel: globalLogger!.config.minLevel,
    enableConsole: globalLogger!.config.enableConsole,
    enableStorage: globalLogger!.config.enableStorage,
  });
}

export function getGlobalLogger(): Logger {
  if (!globalLogger) {
    initializeLogger();
  }
  return globalLogger!;
}
