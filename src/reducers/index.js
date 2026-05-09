import {combineReducers} from 'redux';
import authReducer from './auth.reducer';
import userReducer from './user.reducer';
import itemReducer from './item.reducer';
import customerReducer from './customer.reducer';
import invoiceReducer from './invoice.reducer';

const reducers = {
    authReducer,
    userReducer,
    customerReducer,
    itemReducer,
    invoiceReducer,
};

export { reducers };

const appReducer = combineReducers(reducers);
const rootReducer = (state, action) => {
    if (action.type === 'USER_LOGOUT_SUCCESS') {
        state = {};
    }
    return appReducer(state, action);
};

export default rootReducer;
