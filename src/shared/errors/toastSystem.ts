import { Alert } from 'react-native';

type ToastLevel = 'info' | 'warning' | 'error' | 'success';

export interface ToastMessage {
  title: string;
  message: string;
  level: ToastLevel;
}

type ToastListener = (toast: ToastMessage) => void;

const listeners = new Set<ToastListener>();

export const subscribeToToasts = (listener: ToastListener): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const dispatchToast = (toast: ToastMessage): void => {
  if (listeners.size === 0) {
    Alert.alert(toast.title, toast.message);
    return;
  }

  listeners.forEach((listener) => listener(toast));
};

export const showToast = (title: string, message: string, level: ToastLevel = 'info'): void => {
  dispatchToast({ title, message, level });
};

export const showNetworkFailureToast = (): void => {
  showToast('Connection issue', 'Please check your internet connection and retry.', 'warning');
};

export const showAuthExpiredToast = (): void => {
  showToast('Session expired', 'Your session expired. Please sign in again.', 'error');
};

export const showValidationToast = (message: string): void => {
  showToast('Validation error', message, 'warning');
};
