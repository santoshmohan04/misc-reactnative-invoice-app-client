import {applyMiddleware, createStore, combineReducers} from 'redux';
import {persistReducer, persistStore, persistCombineReducers} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import thunk from 'redux-thunk';
import secureStorage from './secureStorage';
import reducers from '../reducers';

/**
 * Split persistence configuration:
 * - Sensitive data (auth/user) goes to SecureStore
 * - Non-sensitive data (or root) goes to AsyncStorage
 */
const rootPersistConfig = {
  key: 'root',
  storage: AsyncStorage,
  blacklist: ['authReducer', 'userReducer'], // Handled separately or not persisted here
};

const authPersistConfig = {
  key: 'auth',
  storage: secureStorage,
};

const rootReducer = combineReducers({
  ...reducers,
  authReducer: persistReducer(authPersistConfig, reducers.authReducer),
});

const persistedReducer = persistReducer(rootPersistConfig, rootReducer);

export default () => {
    let store = createStore(persistedReducer, {}, applyMiddleware(thunk));
    let persistor = persistStore(store);
    return {store, persistor};
}
