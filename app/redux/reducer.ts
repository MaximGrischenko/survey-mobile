import {combineReducers} from 'redux';
import authReducer, {moduleName as authModule} from './modules/auth';

export default combineReducers({
    [authModule]: authReducer,
})