import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import persist from './src/config/store';

import Main from './src/Main';

const persistStore = persist();

const App = () => {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Provider store={persistStore.store}>
                <PersistGate loading={null} persistor={persistStore.persistor}>
                    <Main/>
                </PersistGate>
            </Provider>
        </GestureHandlerRootView>
    );
};

export default App;
