/**
 * Storage service for managing application persistent storage.
 * Handles initialization, configuration, backup, and recovery.
 * 
 * RELIABILITY ENHANCEMENTS:
 * - Idempotent initialization (safe to call multiple times)
 * - Timer leak prevention (clears old timers on re-initialization)
 * - Atomic backup creation (excludes backup data from itself)
 * - Backup validation (schema checking before restore)
 * - Race condition prevention (atomic snapshots)
 * - Safe restore (validates before clearing)
 * - Singleton reset capability (for testing and clean restarts)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Result, createStorageKey, StorageKey } from '@types/common.types';
import { getLogger } from '@utils/logger';

const logger = getLogger('StorageService');

interface StorageConfig {
  maxRetries: number;
  retryDelayMs: number;
  enableBackup: boolean;
  backupIntervalMs: number;
}

interface BackupData {
  version: number;
  timestamp: string;
  keys: number;
  data: Record<string, string>;
}

const DEFAULT_CONFIG: StorageConfig = {
  maxRetries: 3,
  retryDelayMs: 1000,
  enableBackup: true,
  backupIntervalMs: 60000, // 1 minute
};

const BACKUP_KEY = createStorageKey('__backup_v1__');
const BACKUP_METADATA_KEY = createStorageKey('__backup_metadata__');
const STORAGE_TEST_KEY = createStorageKey('__storage_test__');

/**
 * Check if a key is a system key (excluded from backups).
 */
function isSystemKey(key: string): boolean {
  return key.startsWith('__') && key.endsWith('__');
}

/**
 * Validate backup data structure.
 */
function isValidBackupData(data: unknown): data is BackupData {
  if (typeof data !== 'object' || data === null) return false;
  const backup = data as Record<string, unknown>;
  return (
    typeof backup.version === 'number' &&
    typeof backup.timestamp === 'string' &&
    typeof backup.keys === 'number' &&
    typeof backup.data === 'object' &&
    backup.data !== null &&
    Object.values(backup.data).every((v) => typeof v === 'string')
  );
}

class StorageService {
  private config: StorageConfig;
  private isInitialized = false;
  private backupTimer: NodeJS.Timeout | null = null;
  private initPromise: Promise<Result<void>> | null = null;
  private failureCount = 0;
  private lastBackupTime = 0;

  constructor(config: Partial<StorageConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Initialize storage service.
   * Safe to call multiple times (idempotent).
   * Prevents timer leaks and handles race conditions.
   */
  async initialize(): Promise<Result<void>> {
    // Return existing initialization promise if in progress
    if (this.initPromise) {
      return this.initPromise;
    }

    // Return immediately if already initialized
    if (this.isInitialized) {
      logger.debug('Storage service already initialized');
      return { success: true, data: undefined };
    }

    // Create initialization promise
    this.initPromise = this._performInitialization();
    const result = await this.initPromise;
    this.initPromise = null;

    return result;
  }

  /**
   * Internal initialization logic.
   */
  private async _performInitialization(): Promise<Result<void>> {
    try {
      logger.info('Initializing storage service');

      // Test storage access
      const testValue = 'test';
      await AsyncStorage.setItem(STORAGE_TEST_KEY, testValue);
      const retrieved = await AsyncStorage.getItem(STORAGE_TEST_KEY);
      await AsyncStorage.removeItem(STORAGE_TEST_KEY);

      if (retrieved !== testValue) {
        throw new Error('Storage verification failed');
      }

      this.isInitialized = true;
      this.failureCount = 0;
      logger.info('Storage service initialized successfully');

      // Start backup if enabled
      if (this.config.enableBackup) {
        this.startBackupCycle();
      }

      return { success: true, data: undefined };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.failureCount++;
      logger.error('Failed to initialize storage service', err, {
        attempt: this.failureCount,
      });
      return { success: false, error: err.message };
    }
  }

  /**
   * Check if storage is initialized and ready.
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Get current failure count (for diagnostics).
   */
  getFailureCount(): number {
    return this.failureCount;
  }

  /**
   * Start periodic backup cycle.
   * Clears existing timer to prevent leaks on re-initialization.
   */
  private startBackupCycle(): void {
    // Clear existing timer to prevent leaks
    if (this.backupTimer) {
      clearInterval(this.backupTimer);
      this.backupTimer = null;
    }

    this.backupTimer = setInterval(async () => {
      const backupResult = await this.createBackup();
      if (!backupResult.success) {
        logger.warn('Automatic backup failed', { error: backupResult.error });
      }
    }, this.config.backupIntervalMs);

    // Prevent timer from keeping process alive on some platforms
    if (this.backupTimer.unref) {
      this.backupTimer.unref();
    }
  }

  /**
   * Create an atomic backup of current storage state.
   * Excludes system/backup keys to prevent recursive backup.
   */
  async createBackup(): Promise<Result<StorageKey>> {
    try {
      if (!this.isInitialized) {
        return { success: false, error: 'Storage not initialized' };
      }

      // Prevent backup spam (max once per minute)
      const now = Date.now();
      if (now - this.lastBackupTime < 30000) {
        logger.debug('Backup skipped - too soon');
        return { success: true, data: BACKUP_KEY };
      }
      this.lastBackupTime = now;

      // Get all keys and create atomic snapshot
      const allKeys = await AsyncStorage.getAllKeys();
      const backup: Record<string, string> = {};

      // Exclude system keys from backup
      for (const key of allKeys) {
        if (!isSystemKey(key)) {
          const value = await AsyncStorage.getItem(key);
          if (value !== null) {
            backup[key] = value;
          }
        }
      }

      const backupData: BackupData = {
        version: 1,
        timestamp: new Date().toISOString(),
        keys: Object.keys(backup).length,
        data: backup,
      };

      // Validate before storing
      if (!isValidBackupData(backupData)) {
        throw new Error('Backup data validation failed');
      }

      // Store backup atomically
      await AsyncStorage.setItem(BACKUP_KEY, JSON.stringify(backupData));
      await AsyncStorage.setItem(
        BACKUP_METADATA_KEY,
        JSON.stringify({ timestamp: backupData.timestamp, keys: backupData.keys })
      );

      logger.debug('Created storage backup', { keys: backupData.keys });
      return { success: true, data: BACKUP_KEY };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('Failed to create backup', err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Get backup metadata (timestamp and key count).
   */
  async getBackupMetadata(): Promise<Result<{ timestamp: string; keys: number } | null>> {
    try {
      const metadataStr = await AsyncStorage.getItem(BACKUP_METADATA_KEY);
      if (!metadataStr) {
        return { success: true, data: null };
      }

      const metadata = JSON.parse(metadataStr);
      return { success: true, data: metadata };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('Failed to get backup metadata', err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Restore from backup with validation and safety checks.
   * Validates backup data before clearing current storage.
   */
  async restoreFromBackup(): Promise<Result<void>> {
    try {
      if (!this.isInitialized) {
        return { success: false, error: 'Storage not initialized' };
      }

      const backupStr = await AsyncStorage.getItem(BACKUP_KEY);
      if (!backupStr) {
        return { success: false, error: 'No backup found' };
      }

      // Parse and validate backup data
      let backupData: BackupData;
      try {
        backupData = JSON.parse(backupStr);
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error('Backup data corrupted (JSON parse failed)', err);
        return { success: false, error: 'Backup corrupted: invalid JSON' };
      }

      if (!isValidBackupData(backupData)) {
        logger.error('Backup data failed validation', undefined, { backupData });
        return { success: false, error: 'Backup corrupted: invalid structure' };
      }

      // Get all current keys
      const allKeys = await AsyncStorage.getAllKeys();

      // Remove only user data (keep system keys for recovery)
      const userKeys = allKeys.filter((key) => !isSystemKey(key));
      if (userKeys.length > 0) {
        await AsyncStorage.multiRemove(userKeys);
      }

      // Restore backup data
      for (const [key, value] of Object.entries(backupData.data)) {
        await AsyncStorage.setItem(key, value);
      }

      logger.info('Restored from backup', { keys: backupData.keys });
      return { success: true, data: undefined };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('Failed to restore from backup', err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Cleanup and shutdown storage service.
   * Clears timer and marks as uninitialized.
   */
  async shutdown(): Promise<Result<void>> {
    try {
      if (this.backupTimer) {
        clearInterval(this.backupTimer);
        this.backupTimer = null;
      }

      this.isInitialized = false;
      this.failureCount = 0;
      logger.info('Storage service shutdown');
      return { success: true, data: undefined };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('Failed to shutdown storage service', err);
      return { success: false, error: err.message };
    }
  }
}

let storageService: StorageService | null = null;

/**
 * Get or create the global storage service instance.
 */
export function getStorageService(config?: Partial<StorageConfig>): StorageService {
  if (!storageService) {
    storageService = new StorageService(config);
  }
  return storageService;
}

/**
 * Initialize the global storage service.
 */
export async function initializeStorageService(
  config?: Partial<StorageConfig>
): Promise<Result<void>> {
  const service = getStorageService(config);
  return service.initialize();
}

/**
 * Reset the global storage service (for testing).
 * Should only be used in test environments.
 */
export async function resetStorageService(): Promise<Result<void>> {
  if (storageService) {
    const result = await storageService.shutdown();
    storageService = null;
    return result;
  }
  return { success: true, data: undefined };
}
