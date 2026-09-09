/**
 * Tests for BVN Engine (blocked state verification).
 */

import { getBVNEngine } from '@services/bvn-engine';

describe('BVN Engine', () => {
  it('should exist but remain blocked', async () => {
    const engine = getBVNEngine();
    expect(engine).toBeDefined();
  });

  it('should fail initialization with BLOCKED message', async () => {
    const engine = getBVNEngine();
    const result = await engine.initialize();

    expect(result.success).toBe(false);
    expect(result.error).toContain('BLOCKED');
    expect(result.error).toContain('awaiting specification');
  });

  it('should indicate not ready', () => {
    const engine = getBVNEngine();
    expect(engine.isReady()).toBe(false);
  });

  it('should fail all operations with BLOCKED message', async () => {
    const engine = getBVNEngine();

    const createResult = await engine.createRoot({});
    expect(createResult.success).toBe(false);
    expect(createResult.error).toContain('BLOCKED');

    const transformResult = await engine.transformAB({} as any);
    expect(transformResult.success).toBe(false);
    expect(transformResult.error).toContain('BLOCKED');
  });

  it('should return consistent blocked status', () => {
    const engine1 = getBVNEngine();
    const engine2 = getBVNEngine();
    expect(engine1).toBe(engine2); // Singleton pattern
    expect(engine1.isReady()).toBe(engine2.isReady());
  });
});
