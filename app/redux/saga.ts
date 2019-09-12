import {saga as authSaga} from './modules/auth';
import {saga as mapSaga} from './modules/map';
import {saga as dialogSaga} from './modules/dialogs';
import {saga as adminSaga} from './modules/admin';

import {all} from 'redux-saga/effects';

export default function* rootSaga () {
    yield all([
        authSaga(),
        mapSaga(),
        dialogSaga(),
        adminSaga()
    ])
}