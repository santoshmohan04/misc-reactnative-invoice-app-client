/**
 * Environment configuration for the mobile app
 * Automatically selects API URL based on environment
 */

import { Platform } from 'react-native';
import Constants from 'expo-constants';

const ENV = {
  dev: {
    apiUrl: 'http://localhost:3333',
    apiTimeout: 30000,
  },
  staging: {
    apiUrl: 'https://staging-api.invoice-app.com',
    apiTimeout: 30000,
  },
  prod: {
    apiUrl: 'https://api.invoice-app.com',
    apiTimeout: 30000,
  },
};

type EnvironmentType = 'dev' | 'staging' | 'prod';

const runtimeEnv = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {};

// Get environment from process.env or default to dev
const getEnvironment = (): EnvironmentType => {
  // Check EXPO_PUBLIC_ENV (Expo convention for public env vars)
  const env = runtimeEnv.EXPO_PUBLIC_ENV as EnvironmentType | undefined;
  if (env && env in ENV) {
    return env;
  }
  return 'dev';
};

export const getConfig = () => {
  const environment = getEnvironment();
  return ENV[environment];
};

const getApiUrlFromExpoConfig = (): string | null => {
  const extra = (Constants.expoConfig?.extra ?? null) as
    | { baseUrl?: string; webBaseUrl?: string }
    | null;

  if (!extra) {
    return null;
  }

  if (Platform.OS === 'web') {
    return extra.webBaseUrl ?? extra.baseUrl ?? null;
  }

  return extra.baseUrl ?? null;
};

export const getApiUrl = () => {
  // Allow override via EXPO_PUBLIC_API_URL
  if (runtimeEnv.EXPO_PUBLIC_API_URL) {
    return runtimeEnv.EXPO_PUBLIC_API_URL;
  }

  const configApiUrl = getApiUrlFromExpoConfig();
  if (configApiUrl) {
    return configApiUrl;
  }

  return getConfig().apiUrl;
};

export const getApiTimeout = () => {
  return getConfig().apiTimeout;
};

export default {
  getConfig,
  getApiUrl,
  getApiTimeout,
};
