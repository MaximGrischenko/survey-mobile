import {saga as authSaga} from './modules/auth';
import {saga as mapSaga} from './modules/map';
import {saga as dialogSaga} from './modules/dialogs';
import {saga as adminSaga} from './modules/admin';
import {saga as connectSaga} from './modules/connect';

import {all} from 'redux-saga/effects';

export default function* rootSaga () {
    yield all([
        authSaga(),
        mapSaga(),
        dialogSaga(),
        adminSaga(),
        connectSaga()
    ])
}