/**
 * Application state store using Zustand.
 * Manages global application state and initialization.
 */

import { create } from 'zustand';
import { AppStore, AppContextState } from '@types/app.types';
import { AppInitState, AppError, ErrorType, createISOTimestamp } from '@types/common.types';

const initialState: AppContextState = {
  initState: AppInitState.INITIALIZING,
  error: null,
  isOnline: true,
  isStorageReady: false,
  isLoggerReady: false,
};

export const useAppStore = create<AppStore>((set) => ({
  ...initialState,

  setInitState: (initState) =>
    set((state) => {
      if (state.initState !== initState) {
        console.log(`[AppStore] Init state changed: ${state.initState} → ${initState}`);
        return { initState };
      }
      return state;
    }),

  setError: (error) =>
    set((state) => {
      if (error?.message !== state.error?.message) {
        if (error) {
          console.error(`[AppStore] Error set:`, error);
        } else {
          console.log('[AppStore] Error cleared');
        }
        return { error };
      }
      return state;
    }),

  setOnlineStatus: (isOnline) =>
    set((state) => {
      if (state.isOnline !== isOnline) {
        console.log(`[AppStore] Online status: ${isOnline}`);
        return { isOnline };
      }
      return state;
    }),

  setStorageReady: (ready) =>
    set((state) => {
      if (state.isStorageReady !== ready) {
        console.log(`[AppStore] Storage ready: ${ready}`);
        return { isStorageReady: ready };
      }
      return state;
    }),

  setLoggerReady: (ready) =>
    set((state) => {
      if (state.isLoggerReady !== ready) {
        console.log(`[AppStore] Logger ready: ${ready}`);
        return { isLoggerReady: ready };
      }
      return state;
    }),

  reset: () => set(initialState),
}));

/**
 * Create a branded app error.
 */
export function createAppError(
  message: string,
  type: ErrorType = ErrorType.UNKNOWN_ERROR,
  recoverable = true
): AppError {
  const error = new Error(message) as AppError;
  error.type = type;
  error.timestamp = createISOTimestamp();
  error.recoverable = recoverable;
  return error;
}

/**
 * Update app error state.
 */
export function setAppError(
  message: string,
  type: ErrorType = ErrorType.UNKNOWN_ERROR,
  recoverable = true
): void {
  const error = createAppError(message, type, recoverable);
  useAppStore.setState({ error });
}

/**
 * Clear app error.
 */
export function clearAppError(): void {
  useAppStore.setState({ error: null });
}
