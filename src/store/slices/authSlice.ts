import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../../types';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * Set credentials after successful login/register
     * Dispatched by RTK Query auth endpoints
     */
    setCredentials: (
      state,
      action: PayloadAction<{
        user: User;
        access_token?: string;
        token?: string;
        refresh_token?: string;
        refreshToken?: string;
      }>
    ) => {
      const { user, access_token, token, refresh_token, refreshToken } = action.payload;
      state.user = user;
      state.token = access_token ?? token ?? null;
      state.refreshToken = refresh_token ?? refreshToken ?? null;
      state.isAuthenticated = !!(state.token && state.user);
      state.error = null;
    },

    /**
     * Update user profile
     */
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },

    /**
     * Update tokens (called after refresh)
     */
    updateTokens: (
      state,
      action: PayloadAction<{
        access_token?: string;
        token?: string;
        refresh_token?: string;
        refreshToken?: string;
      }>
    ) => {
      const { access_token, token, refresh_token, refreshToken } = action.payload;
      if (access_token || token) {
        state.token = access_token ?? token ?? null;
      }
      if (refresh_token || refreshToken) {
        state.refreshToken = refresh_token ?? refreshToken ?? null;
      }
    },

    /**
     * Set loading state
     */
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    /**
     * Set error state
     */
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    /**
     * Clear auth state (logout)
     */
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
    },

    /**
     * Clear error
     */
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setCredentials,
  setUser,
  updateTokens,
  setLoading,
  setError,
  logout,
  clearError,
} = authSlice.actions;

export default authSlice.reducer;
