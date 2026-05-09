'use client';

import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'next-themes';
import { store } from '@/store';
import { Toaster, toast } from 'sonner';
import { logout } from '@/store/authSlice';
import { apiSlice } from '@/store/apiSlice';
import { clearAuthCookie } from '@/lib/auth-cookie';

const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000;

function SessionGuards() {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout>;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const state = store.getState();
        if (state.auth.isAuthenticated) {
          store.dispatch(logout());
          store.dispatch(apiSlice.util.resetApiState());
          clearAuthCookie();
          toast.info('Session ended due to inactivity. Please sign in again.');
          window.location.assign('/login');
        }
      }, INACTIVITY_TIMEOUT_MS);
    };

    const events: Array<keyof WindowEventMap> = ['click', 'keydown', 'mousemove', 'touchstart'];
    events.forEach((eventName) => window.addEventListener(eventName, resetTimer));
    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      events.forEach((eventName) => window.removeEventListener(eventName, resetTimer));
    };
  }, []);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <SessionGuards />
        {children}
        <Toaster />
      </ThemeProvider>
    </Provider>
  );
}
