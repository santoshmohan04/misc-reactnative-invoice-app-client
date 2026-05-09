/**
 * Environment configuration for the mobile app
 * Automatically selects API URL based on environment
 */

const ENV = {
  dev: {
    apiUrl: 'http://localhost:5000',
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

// Get environment from process.env or default to dev
const getEnvironment = (): EnvironmentType => {
  // Check EXPO_PUBLIC_ENV (Expo convention for public env vars)
  const env = process.env.EXPO_PUBLIC_ENV as EnvironmentType | undefined;
  if (env && env in ENV) {
    return env;
  }
  return 'dev';
};

export const getConfig = () => {
  const environment = getEnvironment();
  return ENV[environment];
};

export const getApiUrl = () => {
  // Allow override via EXPO_PUBLIC_API_URL
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
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
