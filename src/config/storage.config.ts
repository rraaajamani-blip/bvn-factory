/**
 * Storage configuration.
 */

import { StorageConfig } from '@services/storage.service';

export const STORAGE_CONFIG: Partial<StorageConfig> = {
  maxRetries: 3,
  retryDelayMs: 1000,
  enableBackup: true,
  backupIntervalMs: 60000, // 1 minute
};
