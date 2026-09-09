/**
 * Home screen / Index screen.
 * Main entry point after initialization.
 * Displays application status and foundation information.
 */

import React, { useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useAppStore } from '@state/app-store';
import { AppInitState, LogLevel } from '@types/common.types';
import { getLogger } from '@utils/logger';
import { getStorageService } from '@services/storage.service';
import { APP_CONFIG, FEATURE_FLAGS } from '@constants/app.constants';

const logger = getLogger('HomeScreen');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 24,
    marginTop: 16,
  },
  section: {
    marginBottom: 24,
    borderLeftWidth: 3,
    borderLeftColor: '#4a9eff',
    paddingLeft: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4a9eff',
    marginBottom: 8,
  },
  statusBox: {
    backgroundColor: '#242424',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 13,
    color: '#ccc',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  statusLabel: {
    fontWeight: '600',
    color: '#fff',
  },
  statusValue: {
    color: '#4a9eff',
  },
  errorText: {
    color: '#ff6b6b',
  },
  successText: {
    color: '#51cf66',
  },
  warningText: {
    color: '#ffd43b',
  },
  blockedSection: {
    backgroundColor: '#2a1a1a',
    borderLeftColor: '#ff6b6b',
  },
  blockedLabel: {
    color: '#ff6b6b',
  },
  infoText: {
    fontSize: 12,
    color: '#888',
    marginTop: 8,
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 16,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  featureBadge: {
    backgroundColor: '#242424',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    flex: 1,
    minWidth: '45%',
  },
  featureText: {
    fontSize: 12,
    color: '#ccc',
  },
});

export default function HomeScreen() {
  const appStore = useAppStore();
  const [storageInfo, setStorageInfo] = React.useState<{
    used: number;
    available: number;
    total: number;
  } | null>(null);

  useEffect(() => {
    logger.info('Home screen mounted');
    loadStorageInfo();
  }, []);

  const loadStorageInfo = async () => {
    try {
      const storageService = getStorageService();
      if (storageService.isReady()) {
        // Storage info would be loaded here once storage utilities are available
        logger.debug('Storage service is ready');
      }
    } catch (error) {
      logger.error('Failed to load storage info', error as Error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>{APP_CONFIG.APP_NAME}</Text>

        {/* Application Status Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Application Status</Text>
          <View style={styles.statusBox}>
            <Text style={styles.statusText}>
              <Text style={styles.statusLabel}>Version:</Text>{' '}
              <Text style={styles.statusValue}>{APP_CONFIG.APP_VERSION}</Text>
            </Text>
            <Text style={styles.statusText}>
              <Text style={styles.statusLabel}>Build Date:</Text>{' '}
              <Text style={styles.statusValue}>{APP_CONFIG.BUILD_DATE}</Text>
            </Text>
            <Text style={styles.statusText}>
              <Text style={styles.statusLabel}>Environment:</Text>{' '}
              <Text style={styles.statusValue}>{APP_CONFIG.ENVIRONMENT}</Text>
            </Text>
            <Text style={styles.statusText}>
              <Text style={styles.statusLabel}>Debug Mode:</Text>{' '}
              <Text style={APP_CONFIG.DEBUG_MODE ? styles.warningText : styles.successText}>
                {APP_CONFIG.DEBUG_MODE ? 'ON' : 'OFF'}
              </Text>
            </Text>
          </View>
          <Text style={styles.infoText}>
            SPECIFICATION-FIRST architecture: All BVN mathematical logic remains BLOCKED until
            authoritative specification is provided.
          </Text>
        </View>

        <View style={styles.divider} />

        {/* Initialization Status Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Initialization Status</Text>
          <View style={styles.statusBox}>
            <Text style={styles.statusText}>
              <Text style={styles.statusLabel}>Init State:</Text>{' '}
              <Text
                style={[
                  styles.statusValue,
                  appStore.initState === AppInitState.READY
                    ? styles.successText
                    : appStore.initState === AppInitState.ERROR
                      ? styles.errorText
                      : styles.warningText,
                ]}
              >
                {appStore.initState}
              </Text>
            </Text>
            <Text style={styles.statusText}>
              <Text style={styles.statusLabel}>Logger Ready:</Text>{' '}
              <Text style={appStore.isLoggerReady ? styles.successText : styles.errorText}>
                {appStore.isLoggerReady ? '✓' : '✗'}
              </Text>
            </Text>
            <Text style={styles.statusText}>
              <Text style={styles.statusLabel}>Storage Ready:</Text>{' '}
              <Text style={appStore.isStorageReady ? styles.successText : styles.errorText}>
                {appStore.isStorageReady ? '✓' : '✗'}
              </Text>
            </Text>
            <Text style={styles.statusText}>
              <Text style={styles.statusLabel}>Online:</Text>{' '}
              <Text style={appStore.isOnline ? styles.successText : styles.errorText}>
                {appStore.isOnline ? '✓' : '✗'}
              </Text>
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Foundation Features Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Foundation Features</Text>
          <View style={styles.statusBox}>
            <View style={styles.featureGrid}>
              <View style={styles.featureBadge}>
                <Text style={styles.featureText}>
                  {FEATURE_FLAGS.STORAGE_ENABLED ? '✓' : '✗'} Storage
                </Text>
              </View>
              <View style={styles.featureBadge}>
                <Text style={styles.featureText}>
                  {FEATURE_FLAGS.LOGGING_ENABLED ? '✓' : '✗'} Logging
                </Text>
              </View>
              <View style={styles.featureBadge}>
                <Text style={styles.featureText}>
                  {FEATURE_FLAGS.ERROR_REPORTING_ENABLED ? '✓' : '✗'} Error Reporting
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Blocked Features Section */}
        <View style={[styles.section, styles.blockedSection]}>
          <Text style={[styles.sectionTitle, styles.blockedLabel]}>Blocked Features</Text>
          <Text style={styles.infoText}>
            The following features remain BLOCKED until the authoritative BVN/Infinity Root
            mathematical specification is provided:
          </Text>
          <View style={styles.statusBox}>
            <View style={styles.featureGrid}>
              <View style={styles.featureBadge}>
                <Text style={[styles.featureText, styles.errorText]}>
                  ✗ BVN Engine
                </Text>
              </View>
              <View style={styles.featureBadge}>
                <Text style={[styles.featureText, styles.errorText]}>
                  ✗ Infinity Root
                </Text>
              </View>
              <View style={styles.featureBadge}>
                <Text style={[styles.featureText, styles.errorText]}>
                  ✗ 3D Visualization
                </Text>
              </View>
              <View style={styles.featureBadge}>
                <Text style={[styles.featureText, styles.errorText]}>
                  ✗ YouTube Export
                </Text>
              </View>
            </View>
          </View>
          <Text style={styles.infoText}>
            [MISSING — AUTHORITATIVE DEFINITION REQUIRED]
          </Text>
        </View>

        <View style={styles.divider} />

        {/* Architecture Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Architecture</Text>
          <View style={styles.statusBox}>
            <Text style={styles.statusText}>
              Framework:{' '}
              <Text style={styles.statusValue}>Expo Router + React Native</Text>
            </Text>
            <Text style={styles.statusText}>
              Language:{' '}
              <Text style={styles.statusValue}>TypeScript (strict mode)</Text>
            </Text>
            <Text style={styles.statusText}>
              State Management:{' '}
              <Text style={styles.statusValue}>Zustand</Text>
            </Text>
            <Text style={styles.statusText}>
              Storage:{' '}
              <Text style={styles.statusValue}>AsyncStorage</Text>
            </Text>
            <Text style={styles.statusText}>
              Testing:{' '}
              <Text style={styles.statusValue}>Jest + ts-jest</Text>
            </Text>
          </View>
          <Text style={styles.infoText}>
            Complete modular architecture with separation of UI, services, state, and (blocked)
            calculation engines. Ready for BVN mathematical logic integration.
          </Text>
        </View>

        {appStore.error && (
          <>
            <View style={styles.divider} />
            <View style={[styles.section, { borderLeftColor: '#ff6b6b' }]}>
              <Text style={[styles.sectionTitle, { color: '#ff6b6b' }]}>Error State</Text>
              <View style={[styles.statusBox, { backgroundColor: '#3a1a1a' }]}>
                <Text style={[styles.statusText, styles.errorText]}>
                  {appStore.error.message}
                </Text>
                <Text style={[styles.infoText, styles.errorText]}>
                  Type: {appStore.error.type}
                  {appStore.error.recoverable ? ' (recoverable)' : ' (fatal)'}
                </Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
