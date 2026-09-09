/**
 * Storage service for managing application persistent storage.
 * Handles initialization, configuration, and recovery.
 */

import { AsyncStorage } from '@react-native-async-storage/async-storage';
import { Result, createStorageKey } from '@types/common.types';
import { getLogger } from '@utils/logger';

const logger = getLogger('StorageService');

interface StorageConfig {
  maxRetries: number;
  retryDelayMs: number;
  enableBackup: boolean;
  backupIntervalMs: number;
}

const DEFAULT_CONFIG: StorageConfig = {
  maxRetries: 3,
  retryDelayMs: 1000,
  enableBackup: true,
  backupIntervalMs: 60000, // 1 minute
};

class StorageService {
  private config: StorageConfig;
  private isInitialized = false;
  private backupTimer: NodeJS.Timeout | null = null;

  constructor(config: Partial<StorageConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Initialize storage service.
   * Verifies AsyncStorage is accessible and ready.
   */
  async initialize(): Promise<Result<void>> {
    if (this.isInitialized) {
      logger.warn('Storage service already initialized');
      return { success: true, data: undefined };
    }

    try {
      logger.info('Initializing storage service');

      // Test storage access
      const testKey = createStorageKey('__storage_test__');
      const testValue = 'test';

      await AsyncStorage.setItem(testKey, testValue);
      const retrieved = await AsyncStorage.getItem(testKey);
      await AsyncStorage.removeItem(testKey);

      if (retrieved !== testValue) {
        throw new Error('Storage verification failed');
      }

      this.isInitialized = true;
      logger.info('Storage service initialized successfully');

      // Start backup if enabled
      if (this.config.enableBackup) {
        this.startBackupCycle();
      }

      return { success: true, data: undefined };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('Failed to initialize storage service', err);
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
   * Start periodic backup cycle.
   */
  private startBackupCycle(): void {
    if (this.backupTimer) {
      clearInterval(this.backupTimer);
    }

    this.backupTimer = setInterval(async () => {
      const backupResult = await this.createBackup();
      if (!backupResult.success) {
        logger.warn('Automatic backup failed', { error: backupResult.error });
      }
    }, this.config.backupIntervalMs);
  }

  /**
   * Create a backup of current storage state.
   */
  async createBackup(): Promise<Result<string>> {
    try {
      if (!this.isInitialized) {
        return { success: false, error: 'Storage not initialized' };
      }

      const keys = await AsyncStorage.getAllKeys();
      const backup: Record<string, string> = {};

      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        if (value !== null) {
          backup[key] = value;
        }
      }

      const backupData = {
        timestamp: new Date().toISOString(),
        keys: Object.keys(backup).length,
        data: backup,
      };

      const backupKey = createStorageKey('__backup__');
      await AsyncStorage.setItem(backupKey, JSON.stringify(backupData));

      logger.debug('Created storage backup', { keys: backupData.keys });
      return { success: true, data: backupKey };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('Failed to create backup', err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Restore from backup.
   */
  async restoreFromBackup(): Promise<Result<void>> {
    try {
      if (!this.isInitialized) {
        return { success: false, error: 'Storage not initialized' };
      }

      const backupKey = createStorageKey('__backup__');
      const backupStr = await AsyncStorage.getItem(backupKey);

      if (!backupStr) {
        return { success: false, error: 'No backup found' };
      }

      const backupData = JSON.parse(backupStr);

      // Clear current storage
      const allKeys = await AsyncStorage.getAllKeys();
      await AsyncStorage.multiRemove(allKeys);

      // Restore from backup
      for (const [key, value] of Object.entries(backupData.data)) {
        await AsyncStorage.setItem(key, value as string);
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
   */
  async shutdown(): Promise<Result<void>> {
    try {
      if (this.backupTimer) {
        clearInterval(this.backupTimer);
        this.backupTimer = null;
      }

      this.isInitialized = false;
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
