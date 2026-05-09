/**
 * Navigation types - Typed routes, deep links, and navigation params
 */

import type { NavigatorScreenParams } from '@react-navigation/native';
import type { Customer, Item, Invoice } from './domain';

/**
 * Auth Stack Routes
 */
export type AuthStackParamList = {
  login: undefined;
  signup: undefined;
  'forgot-password': undefined;
};

/**
 * App Stack Routes - Main tabs
 */
export type AppStackParamList = {
  splash: undefined;
  home: NavigatorScreenParams<BottomTabParamList> | undefined;
  profile: undefined;
  invoiceForm: { invoice?: Invoice | null; newNumber?: string } | undefined;
  customerForm: { customer?: Customer | null } | undefined;
  itemForm: { item?: Item | null } | undefined;
};

/**
 * Bottom Tab Routes
 */
export type BottomTabParamList = {
  invoices: undefined;
  customers: undefined;
  items: undefined;
};

/**
 * Invoices Stack Routes
 */
export type InvoicesStackParamList = {
  'invoice-list': undefined;
  'invoice-form': { invoice?: Invoice } | undefined;
  'invoice-detail': { invoiceId: string };
};

/**
 * Customers Stack Routes
 */
export type CustomersStackParamList = {
  'customer-list': undefined;
  'customer-form': { customer?: Customer } | undefined;
  'customer-detail': { customerId: string };
};

/**
 * Items Stack Routes
 */
export type ItemsStackParamList = {
  'item-list': undefined;
  'item-form': { item?: Item } | undefined;
  'item-detail': { itemId: string };
};

/**
 * Root navigator combining auth and app stacks
 */
export type RootStackParamList = AuthStackParamList & AppStackParamList;

/**
 * Deep link definitions for universal links
 */
export const LinkingConfiguration = {
  prefixes: ['https://invoiceapp.com', 'invoiceapp://'],
  config: {
    screens: {
      login: 'login',
      signup: 'signup',
      home: 'app/:screen',
      invoices: 'invoices',
      'invoice-detail': 'invoices/:invoiceId',
      'invoice-form': 'invoices/new',
      customers: 'customers',
      'customer-detail': 'customers/:customerId',
      'customer-form': 'customers/new',
      items: 'items',
      'item-detail': 'items/:itemId',
      'item-form': 'items/new',
      profile: 'profile',
    },
  },
};

/**
 * Navigation action types
 */
export type NavigationAction =
  | { type: 'RESET'; payload: any }
  | { type: 'NAVIGATE'; payload: { name: string; params?: any } }
  | { type: 'GO_BACK' };
