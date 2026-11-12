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
 * Persists the auth slice only (not API cache). persistReducer wraps the auth
 * reducer directly, so its whitelist would refer to auth's own keys, not 'auth'.
 */
const persistConfig = {
  key: 'auth',
  storage: AsyncStorage,
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
        ignoredActionPaths: [
          'meta.arg',
          'payload.headers',
          'meta.baseQueryMeta.request',
          'meta.baseQueryMeta.response',
        ],
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
