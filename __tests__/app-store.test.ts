/**
 * Tests for application store and state management.
 */

import { useAppStore, setAppError, clearAppError, createAppError } from '@state/app-store';
import { AppInitState, ErrorType } from '@types/common.types';

describe('App Store', () => {
  beforeEach(() => {
    // Reset store to initial state
    useAppStore.setState({
      initState: AppInitState.INITIALIZING,
      error: null,
      isOnline: true,
      isStorageReady: false,
      isLoggerReady: false,
    });
  });

  it('should initialize with default state', () => {
    const state = useAppStore.getState();
    expect(state.initState).toBe(AppInitState.INITIALIZING);
    expect(state.error).toBeNull();
    expect(state.isOnline).toBe(true);
  });

  it('should set init state', () => {
    useAppStore.getState().setInitState(AppInitState.READY);
    expect(useAppStore.getState().initState).toBe(AppInitState.READY);
  });

  it('should set error', () => {
    const error = createAppError('Test error', ErrorType.VALIDATION_ERROR, true);
    useAppStore.getState().setError(error);
    expect(useAppStore.getState().error).toEqual(error);
  });

  it('should create app error with type', () => {
    const error = createAppError('Test', ErrorType.STORAGE_ERROR, false);
    expect(error.message).toBe('Test');
    expect(error.type).toBe(ErrorType.STORAGE_ERROR);
    expect(error.recoverable).toBe(false);
    expect(error.timestamp).toBeDefined();
  });

  it('should set app error via helper', () => {
    setAppError('Error message', ErrorType.INITIALIZATION_ERROR);
    const state = useAppStore.getState();
    expect(state.error).toBeDefined();
    expect(state.error?.message).toBe('Error message');
    expect(state.error?.type).toBe(ErrorType.INITIALIZATION_ERROR);
  });

  it('should clear app error', () => {
    setAppError('Error message');
    clearAppError();
    expect(useAppStore.getState().error).toBeNull();
  });

  it('should set online status', () => {
    useAppStore.getState().setOnlineStatus(false);
    expect(useAppStore.getState().isOnline).toBe(false);
  });

  it('should set storage ready', () => {
    useAppStore.getState().setStorageReady(true);
    expect(useAppStore.getState().isStorageReady).toBe(true);
  });

  it('should set logger ready', () => {
    useAppStore.getState().setLoggerReady(true);
    expect(useAppStore.getState().isLoggerReady).toBe(true);
  });

  it('should reset store', () => {
    useAppStore.getState().setInitState(AppInitState.READY);
    setAppError('Error');
    useAppStore.getState().setStorageReady(true);

    useAppStore.getState().reset();

    const state = useAppStore.getState();
    expect(state.initState).toBe(AppInitState.INITIALIZING);
    expect(state.error).toBeNull();
    expect(state.isStorageReady).toBe(false);
  });
});
