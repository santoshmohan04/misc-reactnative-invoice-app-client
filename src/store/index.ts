import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import {
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authSlice from './slices/authSlice';
import customerSlice from './slices/customerSlice';
import invoiceSlice from './slices/invoiceSlice';
import itemSlice from './slices/itemSlice';
import userSlice from './slices/userSlice';
import { authApi } from './apis/authApi';
import { dataApi } from './apis/dataApi';

/**
 * Redux persist configuration
 * Saves auth state to AsyncStorage for offline access
 */
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth'], // Only persist auth state, not API cache
};

const persistedAuthReducer = persistReducer(persistConfig, authSlice);

/**
 * Redux store configuration with RTK + RTK Query + Persistence
 * Combines traditional Redux slices with RTK Query APIs and offline support
 */
export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    customerUI: customerSlice,
    invoiceUI: invoiceSlice,
    itemUI: itemSlice,
    user: userSlice,
    [authApi.reducerPath]: authApi.reducer,
    [dataApi.reducerPath]: dataApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        ignoredActionPaths: ['meta.arg', 'payload.headers'],
        ignoredPaths: ['auth.error'],
      },
    })
      .concat(authApi.middleware)
      .concat(dataApi.middleware),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
