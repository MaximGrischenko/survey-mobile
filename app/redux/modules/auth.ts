import {API, appName} from '../../config';
import {Record} from 'immutable';
import {all, cps, call, put, take, takeEvery} from 'redux-saga/effects';
import axios from 'react-native-axios';
import {createSelector} from 'reselect';
import {AsyncStorage} from 'react-native';

export async function applyHeader(access_token: string = '') {
    axios.defaults.headers.common['authorization'] = access_token;
    if (access_token) {
        await AsyncStorage.setItem('access_token', access_token);
    } else {
        await AsyncStorage.removeItem('access_token');
        delete axios.defaults.headers.common['authorization'];
    }
}

export const moduleName = 'auth';
export const SIGN_OUT = `${appName}/${moduleName}/SIGN_OUT`;
export const SIGN_OUT_SUCCESS = `${appName}/${moduleName}/SIGN_OUT_SUCCESS`;
export const SIGN_OUT_ERROR = `${appName}/${moduleName}/SIGN_OUT_ERROR`;
export const SIGN_IN = `${appName}/${moduleName}/SIGN_IN`;
export const SIGN_IN_REQUEST = `${appName}/${moduleName}/SIGN_IN_REQUEST`;
export const SIGN_IN_ERROR = `${appName}/${moduleName}/SIGN_IN_ERROR`;
export const SIGN_IN_SUCCESS = `${appName}/${moduleName}/SIGN_IN_SUCCESS`;

export const SIGN_UP = `${appName}/${moduleName}/SIGN_UP`;
export const SIGN_UP_REQUEST = `${appName}/${moduleName}/SIGN_UP_REQUEST`;
export const SIGN_UP_ERROR = `${appName}/${moduleName}/SIGN_UP_ERROR`;
export const SIGN_UP_SUCCESS = `${appName}/${moduleName}/SIGN_UP_SUCCESS`;

export const RESET_PSW = `${appName}/${moduleName}/RESET_PSW`;
export const RESET_PSW_REQUEST = `${appName}/${moduleName}/RESET_PSW_REQUEST`;
export const RESET_PSW_ERROR = `${appName}/${moduleName}/RESET_PSW_ERROR`;
export const RESET_PSW_SUCCESS = `${appName}/${moduleName}/RESET_PSW_SUCCESS`;

export const REQ_RESET_PSW = `${appName}/${moduleName}/REQ_RESET_PSW`;
export const REQ_RESET_PSW_REQUEST = `${appName}/${moduleName}/REQ_RESET_PSW_REQUEST`;
export const REQ_RESET_PSW_ERROR = `${appName}/${moduleName}/REQ_RESET_PSW_ERROR`;
export const REQ_RESET_PSW_SUCCESS = `${appName}/${moduleName}/REQ_RESET_PSW_SUCCESS`;

export const USER_LOAD = `${appName}/${moduleName}/USER_LOAD`;
export const USER_LOAD_REQUEST = `${appName}/${moduleName}/USER_LOAD_REQUEST`;
export const USER_LOAD_SUCCESS = `${appName}/${moduleName}/USER_LOAD_SUCCESS`;
export const USER_LOAD_ERROR = `${appName}/${moduleName}/USER_LOAD_ERROR`;
export const USER_ABOUT = `${appName}/${moduleName}/USER_ABOUT`;
export const USER_ABOUT_REQUEST = `${appName}/${moduleName}/USER_ABOUT_REQUEST`;
export const USER_ABOUT_SUCCESS = `${appName}/${moduleName}/USER_ABOUT_SUCCESS`;
export const USER_ABOUT_ERROR = `${appName}/${moduleName}/USER_ABOUT_ERROR`;
export const SIGN_OUT_REQUEST = `${appName}/${moduleName}/SIGN_OUT_REQUEST`;

export const CHANGE_SETTINGS = `${appName}/${moduleName}/CHANGE_SETTINGS`;
export const CHANGE_SETTINGST_SUCCESS = `${appName}/${moduleName}/CHANGE_SETTINGST_SUCCESS`;

import _ from 'lodash';

export const USER_ROLE = {
    ADMIN: 2,
    SUPER_USER: 1,
    USER: 3
};
const MapRecord: any = {
    refreshed: Date.now(),
    search: null,
    searchKey: null,
    user: null,
    userMedicationStatementInfo: null,
    userFamilyInfo: null,
    userAllergiesInfo: null,
    userLabResultInfo: null,
    userVitalInfo: null,
    loading: false,
    isChecked: false,
    error: null,
};
export const ReducerRecord = Record(_.cloneDeep(MapRecord));

export default function reducer(state = new ReducerRecord(), action: any) {
    const {type, payload, error} = action;

    switch (type) {
        case RESET_PSW_REQUEST:
        case REQ_RESET_PSW_REQUEST:
        case SIGN_UP_REQUEST:
        case USER_ABOUT_REQUEST:
        case SIGN_OUT_REQUEST:
        case SIGN_IN_REQUEST:
            return state.set('loading', true)
                .set('error', null);

        case SIGN_IN_SUCCESS:
            return state
                .set('loading', false)
                .set('error', null);

        case CHANGE_SETTINGST_SUCCESS:
            return state
                .set('loading', false)
                .set(payload.name, payload.value)
                .set('error', null);

        case USER_ABOUT_SUCCESS: {
            return state
                .set('loading', false)
                .set('isChecked', true)
                .set('user', action.payload)
                .set('error', null);
        }
        case USER_ABOUT_ERROR: {
            return state
                .set('loading', false)
                .set('isChecked', true)
                .set('error', null);
        }
        case SIGN_UP_SUCCESS: {
            return state
                .set('error', null);
        }
        case REQ_RESET_PSW_SUCCESS:
        case RESET_PSW_SUCCESS: {
            return state
                .set('refreshed', Date.now())
                .set('loading', false)
                .set('error', null);
        }

        case RESET_PSW_ERROR:
        case REQ_RESET_PSW_ERROR:
        case SIGN_UP_ERROR:
        case SIGN_OUT_ERROR:
        case SIGN_IN_ERROR:
            return state
                .set('loading', false)
                .set('isChecked', true)
                .set('error', error);

        case SIGN_OUT_SUCCESS: {
            const ReducerRecord = Record({
                ..._.cloneDeep(MapRecord),
                isChecked: true
            });
            return new ReducerRecord();
        }

        default:
            return state;
    }
}

export const stateSelector = (state: any) => state[moduleName];
export const userSelector = createSelector(stateSelector, state => state.get('user'));
export const searchSelector = createSelector(stateSelector, state => state.get('search'));
export const isSuperAdminSelector = createSelector(stateSelector, state => {
    const user = state.get('user');
    return user && user.info && user.info.data.role < USER_ROLE.USER
});
export const isSuperADMINAdminSelector = createSelector(stateSelector, state => {
    const user = state.get('user');
    return user && user.info && user.info.data.role === USER_ROLE.SUPER_USER
});


export function changeSettings(data: any) {
    return {
        type: CHANGE_SETTINGS,
        payload: data
    };
}

export function signOut() {
    return {
        type: SIGN_OUT,
    };
}

export function signIn(user: any) {
    return {
        type: SIGN_IN,
        payload: user,
    };
}

export function signUp(user: any) {
    return {
        type: SIGN_UP,
        payload: user,
    };
}

export function resetPsw(user: any) {
    return {
        type: RESET_PSW,
        payload: user,
    };
}

export function reqResetPsw(user: any) {
    return {
        type: REQ_RESET_PSW,
        payload: user,
    };
}

export function loadUser() {
    return {
        type: USER_LOAD,
    };
}

const changeSettingsSaga = function* ({payload}: any) {
    yield put({
        type: CHANGE_SETTINGST_SUCCESS,
        payload
    });
};

const signOutSaga = function* () {
    try {
        yield put({
            type: SIGN_OUT_REQUEST,
        });
        const res = yield call(() => {
                return axios.get(`${API}api/logout`);
            },
        );
        applyHeader();
        yield put({
            type: SIGN_OUT_SUCCESS,
        });

    } catch (error) {
        yield put({
            type: SIGN_OUT_ERROR,
            error: error.response.data.message,
        });
    }
};

const signInSaga = function* (action: any) {
    try {
        yield put({
            type: SIGN_IN_REQUEST,
        });
        const res = yield call(() => {
                return axios.post(`${API}auth/login`, action.payload);
            },
        );
        applyHeader(res.data.access_token);
        yield put({
            type: SIGN_IN_SUCCESS,
        });
        yield loadInfo();

    } catch (error) {
        yield put({
            type: SIGN_IN_ERROR,
            error: error.response.data.message,
        });
    }
};

const signUpSaga = function* (action: any) {
    try {
        yield put({
            type: SIGN_UP_REQUEST,
        });
        const res = yield call(() => {
                return axios.post(`${API}auth/register`, action.payload);
            },
        );
        alert('User was created!');
        location.href = "/";
        yield put({
            type: SIGN_UP_SUCCESS,
        });

    } catch (error) {
        yield put({
            type: SIGN_UP_ERROR,
            error: error.response.data.message,
        });
    }
};

const resetPswSaga = function* (action: any) {
    try {
        yield put({
            type: RESET_PSW_REQUEST,
        });
        const res = yield call(() => {
                return axios.post(`${API}auth/reset-psw`, action.payload);
            },
        );

        yield put({
            type: RESET_PSW_SUCCESS,
        });

    } catch (error) {
        yield put({
            type: RESET_PSW_ERROR,
            error: error.response.data.message,
        });
    }
};

const reqResetPswSaga = function* (action: any) {
    try {
        yield put({
            type: REQ_RESET_PSW_REQUEST,
        });
        const res = yield call(() => {
                return axios.post(`${API}auth/forgot-psw`, action.payload);
            },
        );
        // alert('User reset password  link was sent');
        // location.href = "/";
        yield put({
            type: REQ_RESET_PSW_SUCCESS,
        });

    } catch (error) {
        yield put({
            type: REQ_RESET_PSW_ERROR,
            error: error.response.data.message,
        });
    }
};

const loadUserSaga = function* () {
    try {
        yield loadInfo();
    } catch (error) {
        yield put({
            type: USER_LOAD_ERROR,
            error,
        });
    }
};


const loadInfo = function* () {
    try {
        yield put({
            type: USER_ABOUT_REQUEST,
        });
        const res = yield call(() => {
                return axios.get(`${API}api/user/about`);
            },
        );
        const user = {
            info: res.data,
        };
        yield put({
            type: USER_ABOUT_SUCCESS,
            payload: user,
        });
    } catch (error) {
        yield put({
            type: USER_ABOUT_ERROR,
            error,
        });
    }
};

export const saga = function* () {
    yield all([
        takeEvery(RESET_PSW, resetPswSaga),
        takeEvery(REQ_RESET_PSW, reqResetPswSaga),
        takeEvery(SIGN_IN, signInSaga),
        takeEvery(SIGN_UP, signUpSaga),
        takeEvery(USER_LOAD, loadUserSaga),
        takeEvery(SIGN_OUT, signOutSaga),
        takeEvery(CHANGE_SETTINGS, changeSettingsSaga),
    ]);
};
