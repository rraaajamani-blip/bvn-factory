/**
 * Storage utility functions for safe persistent data access.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageKey, JSONValue, Result } from '@bvn-types/common.types';
import { getLogger } from './logger';

const logger = getLogger('StorageUtils');

/**
 * Safely get a value from storage.
 */
export async function getStorageValue<T extends JSONValue>(
  key: StorageKey
): Promise<Result<T | null>> {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value === null) {
      return { success: true, data: null };
    }

    const parsed = JSON.parse(value) as T;
    return { success: true, data: parsed };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('Failed to get storage value', err, { key });
    return { success: false, error: err.message };
  }
}

/**
 * Safely set a value in storage.
 */
export async function setStorageValue<T extends JSONValue>(
  key: StorageKey,
  value: T
): Promise<Result<void>> {
  try {
    const serialized = JSON.stringify(value);
    await AsyncStorage.setItem(key, serialized);
    logger.debug('Stored value', { key, size: serialized.length });
    return { success: true, data: undefined };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('Failed to set storage value', err, { key });
    return { success: false, error: err.message };
  }
}

/**
 * Safely remove a value from storage.
 */
export async function removeStorageValue(key: StorageKey): Promise<Result<void>> {
  try {
    await AsyncStorage.removeItem(key);
    logger.debug('Removed storage value', { key });
    return { success: true, data: undefined };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('Failed to remove storage value', err, { key });
    return { success: false, error: err.message };
  }
}

/**
 * Safely clear all storage.
 */
export async function clearStorage(): Promise<Result<void>> {
  try {
    await AsyncStorage.clear();
    logger.info('Cleared all storage');
    return { success: true, data: undefined };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('Failed to clear storage', err);
    return { success: false, error: err.message };
  }
}

/**
 * Get all keys in storage.
 */
export async function getStorageKeys(): Promise<Result<string[]>> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    return { success: true, data: [...keys] };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('Failed to get storage keys', err);
    return { success: false, error: err.message };
  }
}

/**
 * Get storage usage info.
 */
export async function getStorageInfo(): Promise<
  Result<{ used: number; available: number; total: number }>
> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    let used = 0;

    for (const key of keys) {
      const value = await AsyncStorage.getItem(key);
      if (value) {
        used += new Blob([value]).size;
      }
    }

    // Approximate total available (varies by platform)
    const total = 10 * 1024 * 1024; // 10MB estimate
    const available = Math.max(0, total - used);

    return { success: true, data: { used, available, total } };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('Failed to get storage info', err);
    return { success: false, error: err.message };
  }
}
