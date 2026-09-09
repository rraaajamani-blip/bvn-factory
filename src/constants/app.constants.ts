/**
 * Application constants.
 */

import { StorageKey, createStorageKey } from '@types/common.types';

/**
 * Storage keys for persistent data.
 */
export const STORAGE_KEYS = {
  // Application state
  APP_INIT_STATE: createStorageKey('app:initState'),
  APP_VERSION: createStorageKey('app:version'),
  APP_LAST_OPENED: createStorageKey('app:lastOpened'),

  // User preferences
  USER_PREFERENCES: createStorageKey('user:preferences'),
  USER_THEME: createStorageKey('user:theme'),
  USER_LANGUAGE: createStorageKey('user:language'),

  // Logs and debugging
  DEBUG_LOGS: createStorageKey('debug:logs'),
  ERROR_LOGS: createStorageKey('debug:errors'),

  // BVN-specific (TBD)
  // Will be populated when BVN specification is available
  BVN_BLOCKED: createStorageKey('bvn:awaiting-specification'),
} as const;

/**
 * Application configuration.
 */
export const APP_CONFIG = {
  APP_NAME: 'BVN Factory',
  APP_VERSION: '0.1.0',
  BUILD_DATE: '2026-09-09',
  ENVIRONMENT: 'development' as const,
  DEBUG_MODE: __DEV__,
} as const;

/**
 * Initialization timeouts (milliseconds).
 */
export const INIT_TIMEOUTS = {
  STORAGE_INIT: 5000,
  LOGGER_INIT: 2000,
  ENGINE_INIT: 10000,
  TOTAL_INIT: 30000,
} as const;

/**
 * Feature flags.
 */
export const FEATURE_FLAGS = {
  // BVN features (all blocked until specification available)
  BVN_ENGINE_ENABLED: false,
  INFINITY_ROOT_ENGINE_ENABLED: false,
  BVN_3D_VISUALIZATION_ENABLED: false,
  BVN_YOUTUBE_EXPORT_ENABLED: false,

  // Foundation features
  STORAGE_ENABLED: true,
  LOGGING_ENABLED: true,
  ERROR_REPORTING_ENABLED: true,
} as const;

/**
 * UI constants.
 */
export const UI_CONFIG = {
  SPLASH_SCREEN_DURATION_MS: 2000,
  SPLASH_SCREEN_MIN_DURATION_MS: 1000,
  ANIMATION_DURATION_MS: 300,
  TOAST_DURATION_MS: 3000,
  MODAL_ANIMATION_MS: 200,
} as const;
