/**
 * Application state and context types.
 */

import { AppInitState, AppError } from './common.types';

/**
 * Application context state.
 */
export interface AppContextState {
  initState: AppInitState;
  error: AppError | null;
  isOnline: boolean;
  isStorageReady: boolean;
  isLoggerReady: boolean;
}

/**
 * Application context actions.
 */
export interface AppContextActions {
  setInitState: (state: AppInitState) => void;
  setError: (error: AppError | null) => void;
  setOnlineStatus: (isOnline: boolean) => void;
  setStorageReady: (ready: boolean) => void;
  setLoggerReady: (ready: boolean) => void;
  reset: () => void;
}

/**
 * Application store type (combined state and actions).
 */
export type AppStore = AppContextState & AppContextActions;

/**
 * Splash screen state.
 */
export interface SplashScreenState {
  isVisible: boolean;
  message: string;
  progress: number; // 0-100
}

/**
 * Navigation parameters.
 */
export type RootStackParamList = {
  index: undefined;
  settings: undefined;
  about: undefined;
  // BVN-specific screens will be added when specification is available
};
