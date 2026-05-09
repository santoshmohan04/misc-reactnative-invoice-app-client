import * as SecureStore from 'expo-secure-store';
import { Storage } from 'redux-persist';

/**
 * Custom storage engine for redux-persist using Expo SecureStore
 * for sensitive data like auth tokens.
 */
const secureStorage: Storage = {
  setItem: async (key: string, value: string) => {
    await SecureStore.setItemAsync(key, value);
    return true;
  },
  getItem: async (key: string) => {
    const value = await SecureStore.getItemAsync(key);
    return value;
  },
  removeItem: async (key: string) => {
    await SecureStore.deleteItemAsync(key);
    return true;
  },
};

export default secureStorage;