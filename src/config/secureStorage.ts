import * as SecureStore from 'expo-secure-store';
import { Storage } from 'redux-persist';

/**
 * Custom storage engine for redux-persist using Expo SecureStore
 * for sensitive data like auth tokens.
 */
const toSecureStoreKey = (key: string): string => {
  // redux-persist commonly uses keys like "persist:auth", but SecureStore
  // allows only alphanumerics, '.', '-', and '_'.
  return key.replace(/[^a-zA-Z0-9._-]/g, '_');
};

const secureStorage: Storage = {
  setItem: async (key: string, value: string) => {
    await SecureStore.setItemAsync(toSecureStoreKey(key), value);
    return true;
  },
  getItem: async (key: string) => {
    const value = await SecureStore.getItemAsync(toSecureStoreKey(key));
    return value;
  },
  removeItem: async (key: string) => {
    await SecureStore.deleteItemAsync(toSecureStoreKey(key));
    return true;
  },
};

export default secureStorage;