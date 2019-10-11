import {combineReducers} from 'redux';
import authReducer, {moduleName as authModule} from './modules/auth';
import mapReducer, {moduleName as mapModule} from './modules/map';
import dialogReducer, {moduleName as dialogsModule} from './modules/dialogs';
import adminReducer, {moduleName as adminModule} from "./modules/admin";
import connectReducer, {moduleName as connectModule} from "./modules/connect";

export default combineReducers({
    [authModule]: authReducer,
    [mapModule]: mapReducer,
    [dialogsModule]: dialogReducer,
    [adminModule]: adminReducer,
    [connectModule]: connectReducer
})