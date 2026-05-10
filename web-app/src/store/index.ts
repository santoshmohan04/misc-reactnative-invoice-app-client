import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from './apiSlice';
import authReducer from './authSlice';

const AUTH_STORAGE_KEY = 'invoice-web-auth';

const loadAuthState = () => {
  if (typeof window === 'undefined') {
    return undefined;
  }

  try {
    const serializedState = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!serializedState) {
      return undefined;
    }

    const parsed = JSON.parse(serializedState) as {
      user?: unknown;
      token?: string | null;
      refreshToken?: string | null;
      isAuthenticated?: boolean;
    };

    return {
      auth: {
        user: parsed.user ?? null,
        token: parsed.token ?? null,
        refreshToken: parsed.refreshToken ?? null,
        isAuthenticated: !!parsed.token || !!parsed.isAuthenticated,
      },
    };
  } catch {
    return undefined;
  }
};

export const store = configureStore({
  preloadedState: loadAuthState(),
  reducer: {
    auth: authReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

if (typeof window !== 'undefined') {
  store.subscribe(() => {
    const { auth } = store.getState();
    window.localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        user: auth.user,
        token: auth.token,
        refreshToken: auth.refreshToken,
        isAuthenticated: auth.isAuthenticated,
      }),
    );
  });
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;