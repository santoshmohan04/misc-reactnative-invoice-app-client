'use client';

import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'next-themes';
import { store } from '@/store';
import { Toaster, toast } from 'sonner';
import { usePathname } from 'next/navigation';
import * as Sentry from '@sentry/nextjs';
import { logout } from '@/store/authSlice';
import { apiSlice } from '@/store/apiSlice';
import { clearAuthCookie } from '@/lib/auth-cookie';

const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000;

function SessionGuards() {
  const pathname = usePathname();
  const appEnv = process.env.NEXT_PUBLIC_APP_ENV ?? process.env.NODE_ENV ?? 'development';

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

  useEffect(() => {
    const state = store.getState();
    const user = state.auth.user;

    if (user?._id) {
      Sentry.setUser({
        id: user._id,
        email: user.email,
        username: user.name,
      });
    } else {
      Sentry.setUser(null);
    }

    Sentry.setTag('environment', appEnv);
    Sentry.setContext('app', {
      version: process.env.NEXT_PUBLIC_APP_VERSION ?? '0.0.0',
      platform: 'web',
      pathname,
    });

    Sentry.addBreadcrumb({
      category: 'navigation',
      level: 'info',
      message: `Route changed: ${pathname}`,
    });
  }, [pathname]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const onOffline = () => {
      toast.warning('You are offline. Some actions may fail.');
      Sentry.captureMessage('Client offline detected', {
        level: 'warning',
        tags: {
          area: 'network',
        },
      });
    };

    const onOnline = () => {
      toast.success('Back online.');
    };

    window.addEventListener('offline', onOffline);
    window.addEventListener('online', onOnline);

    return () => {
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('online', onOnline);
    };
  }, []);

  useEffect(() => {
    const started = performance.now();
    return () => {
      const durationMs = Math.round(performance.now() - started);
      if (durationMs > 1200) {
        Sentry.captureMessage('Slow route transition detected', {
          level: 'warning',
          tags: {
            area: 'navigation',
          },
          extra: {
            pathname,
            durationMs,
          },
        });
      }
    };
  }, [pathname]);

  useEffect(() => {
    const startupMs = Math.round(performance.now());
    if (startupMs > 3000) {
      Sentry.captureMessage('Slow web startup detected', {
        level: 'warning',
        tags: {
          area: 'performance',
        },
        extra: {
          startupMs,
        },
      });
    }
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
