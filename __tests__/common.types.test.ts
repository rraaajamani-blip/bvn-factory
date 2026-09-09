/**
 * Tests for common types and utilities.
 */

import { isUUID, isISOTimestamp, createUUID, createISOTimestamp, createStorageKey } from '@types/common.types';

describe('Common Types', () => {
  describe('UUID', () => {
    it('should validate correct UUID format', () => {
      const validUUID = '550e8400-e29b-41d4-a716-446655440000';
      expect(isUUID(validUUID)).toBe(true);
    });

    it('should reject invalid UUID format', () => {
      expect(isUUID('not-a-uuid')).toBe(false);
      expect(isUUID('550e8400-e29b-41d4-a716')).toBe(false);
      expect(isUUID('')).toBe(false);
      expect(isUUID(null)).toBe(false);
      expect(isUUID(123)).toBe(false);
    });

    it('should create branded UUID', () => {
      const validUUID = '550e8400-e29b-41d4-a716-446655440000';
      const branded = createUUID(validUUID);
      expect(branded).toBe(validUUID);
    });

    it('should throw on invalid UUID creation', () => {
      expect(() => createUUID('invalid')).toThrow();
    });
  });

  describe('ISOTimestamp', () => {
    it('should validate ISO 8601 timestamp', () => {
      const now = new Date().toISOString();
      expect(isISOTimestamp(now)).toBe(true);
    });

    it('should reject invalid timestamp', () => {
      expect(isISOTimestamp('not-a-timestamp')).toBe(false);
      expect(isISOTimestamp('2026-09-09')).toBe(false);
      expect(isISOTimestamp('')).toBe(false);
      expect(isISOTimestamp(null)).toBe(false);
    });

    it('should create ISO timestamp', () => {
      const timestamp = createISOTimestamp();
      expect(isISOTimestamp(timestamp)).toBe(true);
    });

    it('should accept date parameter', () => {
      const date = new Date('2026-09-09T10:00:00Z');
      const timestamp = createISOTimestamp(date);
      expect(timestamp).toContain('2026-09-09');
    });
  });

  describe('StorageKey', () => {
    it('should create storage key', () => {
      const key = createStorageKey('test:key');
      expect(key).toBe('test:key');
    });

    it('should reject empty key', () => {
      expect(() => createStorageKey('')).toThrow();
    });
  });
});
