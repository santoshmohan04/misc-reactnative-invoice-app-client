import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './index';

/**
 * Pre-typed dispatch hook
 * Use throughout the app instead of plain useDispatch()
 */
export const useAppDispatch = () => useDispatch<AppDispatch>();

/**
 * Pre-typed selector hook
 * Use throughout the app instead of plain useSelector()
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

/**
 * Auth selector hooks
 */
export const useAuth = () =>
  useAppSelector((state) => ({
    user: state.auth.user,
    token: state.auth.token,
    isAuthenticated: state.auth.isAuthenticated,
    isLoading: state.auth.isLoading,
    error: state.auth.error,
  }));

export const useAuthUser = () => useAppSelector((state) => state.auth.user);
export const useAuthToken = () => useAppSelector((state) => state.auth.token);
export const useIsAuthenticated = () =>
  useAppSelector((state) => state.auth.isAuthenticated);
export const useAuthError = () => useAppSelector((state) => state.auth.error);
export const useAuthLoading = () => useAppSelector((state) => state.auth.isLoading);
