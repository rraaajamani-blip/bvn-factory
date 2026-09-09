/**
 * Root layout component.
 * Entry point for Expo Router navigation.
 * Handles splash screen, initialization, and error states.
 */

import React, { useEffect, useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useAppStore, setAppError, clearAppError } from '@state/app-store';
import { AppInitState, ErrorType, LogLevel } from '@types/common.types';
import { initializeLogger, getLogger } from '@utils/logger';
import { initializeStorageService } from '@services/storage.service';
import { getBVNEngine } from '@services/bvn-engine';
import { getInfinityRootEngine } from '@services/infinity-root-engine';
import { INIT_TIMEOUTS, APP_CONFIG } from '@constants/app.constants';
import { Animated, View } from 'react-native';

const logger = getLogger('RootLayout');

// Keep splash screen visible while we initialize
SplashScreen.preventAutoHideAsync().catch(() => {});

/**
 * Root layout component with initialization logic.
 */
export default function RootLayout() {
  const router = useRouter();
  const appStore = useAppStore();
  const [isInitComplete, setIsInitComplete] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    const initializeApp = async () => {
      try {
        logger.info('Starting application initialization', {
          version: APP_CONFIG.APP_VERSION,
          environment: APP_CONFIG.ENVIRONMENT,
        });

        useAppStore.setState({ initState: AppInitState.INITIALIZING });

        // Initialize logger first
        logger.info('Initializing logger...');
        initializeLogger(
          APP_CONFIG.DEBUG_MODE ? LogLevel.DEBUG : LogLevel.INFO,
          { enableStorage: true }
        );
        useAppStore.setState({ isLoggerReady: true });
        logger.info('Logger initialized');

        // Initialize storage service
        logger.info('Initializing storage service...');
        const storageResult = await initializeStorageService({
          enableBackup: true,
          backupIntervalMs: 60000,
        });

        if (!storageResult.success) {
          throw new Error(`Storage initialization failed: ${storageResult.error}`);
        }

        useAppStore.setState({ isStorageReady: true });
        logger.info('Storage service initialized');

        // Initialize BVN Engine (will fail gracefully until spec is provided)
        logger.info('Initializing BVN Engine...');
        const bvnEngine = getBVNEngine();
        const bvnResult = await bvnEngine.initialize();
        if (!bvnResult.success) {
          logger.warn('BVN Engine initialization blocked', { error: bvnResult.error });
          // This is expected - BVN is blocked until specification is available
        }

        // Initialize Infinity Root Engine (will fail gracefully until spec is provided)
        logger.info('Initializing Infinity Root Engine...');
        const infinityRootEngine = getInfinityRootEngine();
        const irResult = await infinityRootEngine.initialize();
        if (!irResult.success) {
          logger.warn('Infinity Root Engine initialization blocked', {
            error: irResult.error,
          });
          // This is expected - Infinity Root is blocked until specification is available
        }

        // Mark initialization as complete
        logger.info('Application initialization complete');
        useAppStore.setState({ initState: AppInitState.READY });
        setIsInitComplete(true);

        // Hide splash screen
        await SplashScreen.hideAsync();
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.fatal('Application initialization failed', err);
        setAppError(
          `Initialization failed: ${err.message}`,
          ErrorType.INITIALIZATION_ERROR,
          true
        );
        useAppStore.setState({ initState: AppInitState.ERROR });
        await SplashScreen.hideAsync();
      }
    };

    // Run initialization with timeout
    const initTimeout = setTimeout(() => {
      if (!isInitComplete) {
        logger.error('Initialization timeout');
        setAppError(
          'Application initialization took too long',
          ErrorType.INITIALIZATION_ERROR,
          true
        );
        useAppStore.setState({ initState: AppInitState.ERROR });
      }
    }, INIT_TIMEOUTS.TOTAL_INIT);

    initializeApp();

    return () => clearTimeout(initTimeout);
  }, []);

  // Show splash screen while initializing
  if (appStore.initState === AppInitState.INITIALIZING) {
    return (
      <View style={{ flex: 1, backgroundColor: '#1a1a1a', justifyContent: 'center' }}>
        <Animated.Text
          style={[
            {
              fontSize: 18,
              color: '#fff',
              textAlign: 'center',
              opacity: fadeAnim,
            },
          ]}
        >
          {APP_CONFIG.APP_NAME}
        </Animated.Text>
      </View>
    );
  }

  // Show error state
  if (appStore.initState === AppInitState.ERROR) {
    return (
      <View style={{ flex: 1, backgroundColor: '#1a1a1a', justifyContent: 'center' }}>
        <View style={{ paddingHorizontal: 20 }}>
          <Animated.Text
            style={[
              {
                fontSize: 18,
                color: '#fff',
                textAlign: 'center',
                marginBottom: 16,
                opacity: fadeAnim,
              },
            ]}
          >
            {APP_CONFIG.APP_NAME}
          </Animated.Text>
          <Animated.Text
            style={[
              {
                fontSize: 14,
                color: '#ff6b6b',
                textAlign: 'center',
                opacity: fadeAnim,
              },
            ]}
          >
            {appStore.error?.message || 'An error occurred during initialization'}
          </Animated.Text>
          {appStore.error?.recoverable && (
            <Animated.Text
              style={[
                {
                  fontSize: 12,
                  color: '#888',
                  textAlign: 'center',
                  marginTop: 16,
                  opacity: fadeAnim,
                },
              ]}
            >
              Please restart the application
            </Animated.Text>
          )}
        </View>
      </View>
    );
  }

  // Show main navigation stack
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#1a1a1a',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '600',
        },
        contentStyle: {
          backgroundColor: '#1a1a1a',
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: APP_CONFIG.APP_NAME,
          headerShown: true,
        }}
      />
    </Stack>
  );
}
