import 'react-native-reanimated';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import { TamaguiProvider } from 'tamagui';
import { store, persistor } from './src/store';
import tamaguiConfig from './tamagui.config';

import Main from './src/Main';

const App = () => {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <TamaguiProvider config={tamaguiConfig}>
                <Provider store={store}>
                    <PersistGate loading={null} persistor={persistor}>
                        <Main/>
                    </PersistGate>
                </Provider>
            </TamaguiProvider>
        </GestureHandlerRootView>
    );
};

export default App;
