/**
 * Navigation service - Centralized navigation actions
 * Provides typed navigation methods that can be called from anywhere
 */

import { createNavigationContainerRef, StackActions } from '@react-navigation/native';
import type { RootStackParamList } from '../types';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

/**
 * Navigate to a screen with optional params
 */
function navigate<RouteName extends keyof RootStackParamList>(
  name: RouteName,
  params?: RootStackParamList[RouteName],
): void {
  if (navigationRef.isReady()) {
    if (typeof params === 'undefined') {
      (navigationRef as any).navigate(name);
    } else {
      (navigationRef as any).navigate(name, params);
    }
  }
}

/**
 * Replace current screen with another
 */
function replace<RouteName extends keyof RootStackParamList>(
  name: RouteName,
  params?: RootStackParamList[RouteName],
): void {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(StackActions.replace(name, params as any));
  }
}

/**
 * Go back to previous screen
 */
function pop(): void {
  if (navigationRef.isReady()) {
    navigationRef.goBack();
  }
}

/**
 * Typed action helpers for each route
 */
export const Actions = {
  navigate,
  replace,
  pop,
  refresh: (): void => {
    // Can be extended for refresh logic
  },
  // Auth routes
  login: (params?: RootStackParamList['login']): void => navigate('login', params),
  signup: (params?: RootStackParamList['signup']): void => navigate('signup', params),
  // Main routes
  home: (params?: RootStackParamList['home']): void => navigate('home', params),
  invoices: (): void => navigate('home', { screen: 'invoices' }),
  customers: (): void => navigate('home', { screen: 'customers' }),
  items: (): void => navigate('home', { screen: 'items' }),
  invoiceForm: (params?: RootStackParamList['invoiceForm']): void => navigate('invoiceForm', params),
  customerForm: (params?: RootStackParamList['customerForm']): void => navigate('customerForm', params),
  itemForm: (params?: RootStackParamList['itemForm']): void => navigate('itemForm', params),
  profile: (params?: RootStackParamList['profile']): void => navigate('profile', params),
  splash: (params?: RootStackParamList['splash']): void => navigate('splash', params),
};
