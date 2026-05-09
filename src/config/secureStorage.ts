import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
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

const isWeb = Platform.OS === 'web';

const secureStorage: Storage = {
  setItem: async (key: string, value: string) => {
    if (isWeb) {
      await AsyncStorage.setItem(key, value);
      return true;
    }

    try {
      await SecureStore.setItemAsync(toSecureStoreKey(key), value);
    } catch (error) {
      // Fallback keeps persistence functional if native secure APIs are unavailable.
      await AsyncStorage.setItem(key, value);
    }
    return true;
  },
  getItem: async (key: string) => {
    if (isWeb) {
      return AsyncStorage.getItem(key);
    }

    try {
      return await SecureStore.getItemAsync(toSecureStoreKey(key));
    } catch (error) {
      return AsyncStorage.getItem(key);
    }
  },
  removeItem: async (key: string) => {
    if (isWeb) {
      await AsyncStorage.removeItem(key);
      return true;
    }

    try {
      await SecureStore.deleteItemAsync(toSecureStoreKey(key));
    } catch (error) {
      await AsyncStorage.removeItem(key);
    }
    return true;
  },
};

export default secureStorage;