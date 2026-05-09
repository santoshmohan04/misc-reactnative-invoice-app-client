import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Sentry from '@sentry/react-native';
import type { NavigationContainerRefWithCurrent } from '@react-navigation/native';
import type { RootStackParamList } from '../../types';

const environment = process.env.EXPO_PUBLIC_ENV ?? (process.env.NODE_ENV === 'production' ? 'production' : 'development');
const release = `${Constants.expoConfig?.slug ?? 'invoice-app'}@${Constants.expoConfig?.version ?? '0.0.0'}`;

export const reactNavigationIntegration = Sentry.reactNavigationIntegration({
  enableTimeToInitialDisplay: true,
});

let initialized = false;

export const initSentry = (): void => {
  if (initialized) {
    return;
  }

  Sentry.init({
    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
    enabled: Boolean(process.env.EXPO_PUBLIC_SENTRY_DSN),
    environment,
    release,
    integrations: [reactNavigationIntegration as unknown as any],
    tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
    profilesSampleRate: environment === 'production' ? 0.05 : 1.0,
    debug: environment !== 'production',
    sendDefaultPii: false,
    beforeSend(event) {
      if (event.request?.headers) {
        delete event.request.headers.Authorization;
        delete event.request.headers.authorization;
      }
      return event;
    },
  });

  initialized = true;
};

export const registerNavigationTracing = (
  navigationRef: NavigationContainerRefWithCurrent<RootStackParamList>,
): void => {
  reactNavigationIntegration.registerNavigationContainer(navigationRef);
};

export const setSentryUserContext = (user?: {
  id?: string;
  email?: string;
  name?: string;
}): void => {
  if (!user?.id) {
    Sentry.setUser(null);
    return;
  }

  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.name,
  });

  Sentry.setTag('platform', Platform.OS);
  Sentry.setTag('environment', environment);
  Sentry.setContext('app', {
    version: Constants.expoConfig?.version,
    release,
  });
};

export { Sentry };
