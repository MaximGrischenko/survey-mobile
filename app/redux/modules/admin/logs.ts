import axios from "react-native-axios";
import {API, appName} from "../../../config";

import {all, cps, call, put, take, takeEvery} from 'redux-saga/effects';
import {
    moduleName,
} from './config';


export const FETCH_LOGS_MORE = `${appName}/${moduleName}/FETCH_LOGS_MORE`;
export const FETCH_LOGS = `${appName}/${moduleName}/FETCH_LOGS`;
export const FETCH_LOGS_REQUEST = `${appName}/${moduleName}/FETCH_LOGS_REQUEST`;
export const FETCH_LOGS_ERROR = `${appName}/${moduleName}/FETCH_LOGS_ERROR`;
export const FETCH_LOGS_SUCCESS = `${appName}/${moduleName}/FETCH_LOGS_SUCCESS`;

export function fetchMoreLOGS(location: any) {
    return {
        type: FETCH_LOGS_MORE,
        payload: location
    };
}

export function fetchLOGS(location: any) {
    return {
        type: FETCH_LOGS,
        payload: location
    };
}

export const fetchLOGSSagaMore = function* ({payload}: any) {
    yield put({
        type: FETCH_LOGS_SUCCESS,
        payload: payload.rows
    });
};

export const fetchLOGSSaga = function* (action: any) {
    try {
        yield put({
            type: FETCH_LOGS_REQUEST,
        });
        const res = yield call(() => {
                return axios.get(`${API}api/admin/logs`);
            },
        );
        yield put({
            type: FETCH_LOGS_SUCCESS,
            payload: res.data.rows
        });

    } catch (error) {
        yield put({
            type: FETCH_LOGS_ERROR,
            error: error.response.data.message,
        });
    }
};
