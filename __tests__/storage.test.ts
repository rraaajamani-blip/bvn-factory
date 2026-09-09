/**
 * Tests for storage utilities.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createStorageKey } from '@types/common.types';
import { getStorageValue, setStorageValue, removeStorageValue, clearStorage } from '@utils/storage';

jest.mock('@react-native-async-storage/async-storage');

describe('Storage Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should set and get storage value', async () => {
    const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
    mockAsyncStorage.setItem.mockResolvedValue(undefined as any);
    mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify({ test: 'data' }));

    const key = createStorageKey('test:key');
    const result = await getStorageValue<{ test: string }>(key);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ test: 'data' });
    }
  });

  it('should handle null storage value', async () => {
    const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
    mockAsyncStorage.getItem.mockResolvedValue(null);

    const key = createStorageKey('missing:key');
    const result = await getStorageValue(key);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBeNull();
    }
  });

  it('should handle storage errors', async () => {
    const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
    mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage failed'));

    const key = createStorageKey('error:key');
    const result = await getStorageValue(key);

    expect(result.success).toBe(false);
  });

  it('should remove storage value', async () => {
    const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
    mockAsyncStorage.removeItem.mockResolvedValue(undefined as any);

    const key = createStorageKey('test:key');
    const result = await removeStorageValue(key);

    expect(result.success).toBe(true);
    expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith(key);
  });

  it('should clear storage', async () => {
    const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
    mockAsyncStorage.clear.mockResolvedValue(undefined as any);

    const result = await clearStorage();

    expect(result.success).toBe(true);
    expect(mockAsyncStorage.clear).toHaveBeenCalled();
  });
});
