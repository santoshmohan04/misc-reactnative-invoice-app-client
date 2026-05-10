import 'react-native-reanimated';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { TamaguiProvider } from 'tamagui';
import { store, persistor } from './src/store';
import tamaguiConfig from './tamagui.config';
import { initSentry } from './src/shared/observability/sentry';
import {
  startJsThreadFreezeMonitor,
  trackAppStartup,
} from './src/shared/observability/performance';
import ErrorBoundary from './src/shared/errors/ErrorBoundary';
import GlobalToastHost from './src/shared/errors/GlobalToastHost';
import { logger } from './src/shared/logger';
import Main from './src/Main';

const appStartedAt = performance.now();
initSentry();
startJsThreadFreezeMonitor();

const App: React.FC = () => {
  const onRender = React.useCallback(
    (
      id: string,
      phase: 'mount' | 'update' | 'nested-update',
      actualDuration: number,
    ) => {
      if (actualDuration > 120) {
        logger.warn('Slow render detected', 'render_profiler', {
          id,
          phase,
          actualDuration: Math.round(actualDuration),
        });
      }
    },
    [],
  );

  React.useEffect(() => {
    trackAppStartup(appStartedAt);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <ErrorBoundary>
              <GlobalToastHost />
              <React.Profiler id="root-app" onRender={onRender}>
                <Main />
              </React.Profiler>
            </ErrorBoundary>
          </PersistGate>
        </Provider>
      </TamaguiProvider>
    </GestureHandlerRootView>
  );
};

export default App;
