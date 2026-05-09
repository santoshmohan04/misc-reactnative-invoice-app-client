/**
 * Routes component - Defines navigation structure
 * Manages auth vs app stacks based on login state
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { navigationRef } from '../utils/NavigationService';
import { registerNavigationTracing, Sentry } from '../shared/observability/sentry';
import { logger } from '../shared/logger';
import NavBar from './NavBar';
import {
  CustomerForm,
  Customers,
  InvoiceForm,
  Invoices,
  ItemForm,
  Items,
  Login,
  Profile,
  SignUp,
  Splash,
} from '../pages/index';
import type { BottomTabParamList, RootStackParamList } from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<BottomTabParamList>();

/**
 * HomeTabs - Bottom tab navigation for main app
 */
const HomeTabs: React.FC = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <NavBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="invoices" component={Invoices} />
      <Tab.Screen name="customers" component={Customers} />
      <Tab.Screen name="items" component={Items} />
    </Tab.Navigator>
  );
};

/**
 * AppStack - Main app navigation (after login)
 */
const AppStack: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="splash" component={Splash} />
      <Stack.Screen name="home" component={HomeTabs} />
      <Stack.Screen name="customerForm" component={CustomerForm} />
      <Stack.Screen name="itemForm" component={ItemForm} />
      <Stack.Screen name="invoiceForm" component={InvoiceForm} />
      <Stack.Screen name="profile" component={Profile} />
    </Stack.Navigator>
  );
};

/**
 * AuthStack - Authentication navigation (before login)
 */
const AuthStack: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" component={Login} />
      <Stack.Screen name="signup" component={SignUp} />
    </Stack.Navigator>
  );
};

interface RoutesProps {
  isLoggedIn: boolean;
}

/**
 * Routes - Main router component
 * Switches between auth and app stacks based on login state
 */
const Routes: React.FC<RoutesProps> = ({ isLoggedIn }) => {
  const navReadyAt = React.useRef<number>(0);

  React.useEffect(() => {
    registerNavigationTracing(navigationRef);
  }, []);

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        navReadyAt.current = performance.now();
      }}
      onStateChange={() => {
        const route = navigationRef.getCurrentRoute();
        const now = performance.now();
        const transitionDurationMs = navReadyAt.current > 0 ? Math.round(now - navReadyAt.current) : 0;
        navReadyAt.current = now;

        if (transitionDurationMs > 700) {
          logger.warn('Slow screen transition detected', 'navigation', {
            routeName: route?.name,
            transitionDurationMs,
          });
        }

        Sentry.addBreadcrumb({
          category: 'navigation',
          message: `Route: ${route?.name ?? 'unknown'}`,
          level: 'info',
          data: {
            transitionDurationMs,
          },
        });
      }}
    >
      {isLoggedIn ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default Routes;
