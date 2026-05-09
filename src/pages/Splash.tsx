/**
 * Splash screen with RTK Query data loading
 * Loads invoices, customers, and items on app initialization
 * Implements retry logic and graceful degradation
 */

import React, { useEffect, useState } from 'react';
import { ScrollView, BackHandler, StyleSheet, View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as SplashScreen from 'expo-splash-screen';
import Logo from '../components/Logo';
import { useGetInvoicesQuery } from '../store/apis/dataApi';
import { useGetCustomersQuery } from '../store/apis/dataApi';
import { useGetItemsQuery } from '../store/apis/dataApi';
import type { RootStackParamList } from '../types';

// Keep splash screen visible while fetching data
SplashScreen.preventAutoHideAsync();

// Retry configuration
const RETRY_CONFIG = {
  MAX_RETRIES: 2,
  RETRY_DELAY_MS: 2000,
  LOAD_TIMEOUT_MS: 8000,
};

/**
 * Splash component with graceful degradation
 * Attempts to load all data with retry logic
 * Falls back to partial load instead of forcing app exit
 */
const Splash = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  
  // RTK Query hooks - automatically manage loading/error states
  const invoicesQuery = useGetInvoicesQuery();
  const customersQuery = useGetCustomersQuery();
  const itemsQuery = useGetItemsQuery();

  const [retryCount, setRetryCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingPhase, setIsLoadingPhase] = useState(true);

  // Monitor all queries and transition to home when ready
  useEffect(() => {
    const checkLoadStatus = async () => {
      // Track which assets loaded successfully
      const loadedAssets = {
        invoices: invoicesQuery.isSuccess,
        customers: customersQuery.isSuccess,
        items: itemsQuery.isSuccess,
      };

      // Check if all queries are done (not pending)
      const allQueriesDone =
        invoicesQuery.status !== 'pending' &&
        customersQuery.status !== 'pending' &&
        itemsQuery.status !== 'pending';

      if (!allQueriesDone) {
        // Still loading
        return;
      }

      // Determine if we have minimum viable load (at least invoices + customers)
      const hasMinimalLoad = loadedAssets.invoices && loadedAssets.customers;

      if (!hasMinimalLoad) {
        // Some data failed to load
        const failedAssets = Object.keys(loadedAssets)
          .filter((key): key is keyof typeof loadedAssets => key in loadedAssets)
          .filter((key) => !loadedAssets[key])
          .join(', ');

        handleLoadError(new Error(`Failed to load: ${failedAssets}`));
        return;
      }

      // Success - hide splash and navigate
      try {
        await SplashScreen.hideAsync();
      } catch (e) {
        // Screen already hidden
      }

      setIsLoadingPhase(false);
      // Small delay for better UX before navigation
      setTimeout(() => {
        navigation.replace('home');
      }, 300);
    };

    checkLoadStatus();
  }, [
    invoicesQuery.status,
    customersQuery.status,
    itemsQuery.status,
    navigation,
  ]);

  const handleLoadError = async (err: unknown) => {
    const canRetry = retryCount < RETRY_CONFIG.MAX_RETRIES;

    if (canRetry) {
      // Show retry message
      setError(
        `Loading data failed. Retrying... (${retryCount + 1}/${RETRY_CONFIG.MAX_RETRIES})`,
      );
      setRetryCount(retryCount + 1);

      // Wait before retrying
      await new Promise((resolve) =>
        setTimeout(resolve, RETRY_CONFIG.RETRY_DELAY_MS),
      );

      // Trigger retry by refetching
      invoicesQuery.refetch();
      customersQuery.refetch();
      itemsQuery.refetch();
    } else {
      // No more retries - proceed with degraded state
      const errorMsg =
        (err as { message?: string })?.message || 'Connection error. Please check your network.';

      setError(errorMsg);
      setIsLoadingPhase(false);
      setRetryCount(0);

      // Auto-proceed after showing error
      try {
        await SplashScreen.hideAsync();
      } catch (e) {
        // Screen already hidden
      }

      setTimeout(() => {
        navigation.replace('home');
      }, 3000);
    }
  };

  const handleRetry = () => {
    setRetryCount(0);
    setError(null);
    setIsLoadingPhase(true);
    invoicesQuery.refetch();
    customersQuery.refetch();
    itemsQuery.refetch();
  };

  // Back button - prevent going back from splash
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => true,
    );
    return () => backHandler.remove();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Logo />

          {isLoadingPhase && (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading your data...</Text>
            </View>
          )}

          {error && !isLoadingPhase && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorTitle}>Something went wrong</Text>
              <Text style={styles.errorMessage}>{error}</Text>
              <Text style={styles.infoText}>
                The app will start shortly with limited functionality.
              </Text>
              <Text style={styles.retryButton} onPress={handleRetry}>
                Retry Now
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    padding: 12,
  },
  loadingContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  errorContainer: {
    marginTop: 20,
    paddingHorizontal: 8,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E74C3C',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 13,
    color: '#555555',
    lineHeight: 18,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 12,
    color: '#888888',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  retryButton: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E90FF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    textAlign: 'center',
    marginTop: 8,
  },
});

export default Splash;
