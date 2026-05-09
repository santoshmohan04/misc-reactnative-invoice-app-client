/**
 * Main app component
 * Specifies status bar properties and includes routes
 * Uses RTK hooks for auth state management
 */

import React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import Routes from './components/Routes';
import { useAuthUser, useIsAuthenticated } from './store/hooks';
import { setSentryUserContext } from './shared/observability/sentry';

interface MainProps {}

/**
 * Main component - Root of the application
 * Renders status bar and routes
 */
const Main: React.FC<MainProps> = () => {
  const isAuthenticated = useIsAuthenticated();
  const user = useAuthUser();

  React.useEffect(() => {
    setSentryUserContext(
      user
        ? {
            id: user._id ?? user.id,
            email: user.email,
            name: user.name,
          }
        : undefined,
    );
  }, [user]);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#1c313a" barStyle="light-content" />
      <Routes isLoggedIn={isAuthenticated} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default Main;
