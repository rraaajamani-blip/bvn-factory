/**
 * Common type definitions used across the application.
 * Non-BVN-specific types.
 */

/**
 * Result type for operations that may fail.
 * @template T The type of the success value
 * @template E The type of the error value
 */
export type Result<T, E = string> = 
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * Async result type.
 */
export type AsyncResult<T, E = string> = Promise<Result<T, E>>;

/**
 * UUID string type.
 */
export type UUID = string & { readonly __brand: 'UUID' };

/**
 * ISO 8601 timestamp string.
 */
export type ISOTimestamp = string & { readonly __brand: 'ISOTimestamp' };

/**
 * JSON serializable value.
 */
export type JSONValue = 
  | null
  | boolean
  | number
  | string
  | JSONValue[]
  | { [key: string]: JSONValue };

/**
 * Storage key for persistent data.
 */
export type StorageKey = string & { readonly __brand: 'StorageKey' };

/**
 * Logger levels.
 */
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  FATAL = 'FATAL',
}

/**
 * Log entry structure.
 */
export interface LogEntry {
  timestamp: ISOTimestamp;
  level: LogLevel;
  module: string;
  message: string;
  data?: JSONValue;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

/**
 * Application initialization state.
 */
export enum AppInitState {
  INITIALIZING = 'INITIALIZING',
  READY = 'READY',
  ERROR = 'ERROR',
}

/**
 * Application error types.
 */
export enum ErrorType {
  INITIALIZATION_ERROR = 'INITIALIZATION_ERROR',
  STORAGE_ERROR = 'STORAGE_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  BVN_BLOCKED = 'BVN_BLOCKED',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Branded error type.
 */
export interface AppError extends Error {
  type: ErrorType;
  timestamp: ISOTimestamp;
  recoverable: boolean;
}

/**
 * Type guard for UUID.
 */
export function isUUID(value: unknown): value is UUID {
  if (typeof value !== 'string') return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

/**
 * Type guard for ISOTimestamp.
 */
export function isISOTimestamp(value: unknown): value is ISOTimestamp {
  if (typeof value !== 'string') return false;
  try {
    new Date(value).toISOString();
    return true;
  } catch {
    return false;
  }
}

/**
 * Create branded UUID.
 */
export function createUUID(value: string): UUID {
  if (!isUUID(value)) throw new Error(`Invalid UUID: ${value}`);
  return value as UUID;
}

/**
 * Create ISOTimestamp.
 */
export function createISOTimestamp(date: Date = new Date()): ISOTimestamp {
  return date.toISOString() as ISOTimestamp;
}

/**
 * Create StorageKey.
 */
export function createStorageKey(value: string): StorageKey {
  if (!value || value.length === 0) throw new Error('Storage key cannot be empty');
  return value as StorageKey;
}
