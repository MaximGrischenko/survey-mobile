import axios from "react-native-axios";
import {API, appName} from "../../../config";

import {all, cps, call, put, take, takeEvery} from 'redux-saga/effects';
import {
    LOADED_PROJECT_DATA,
    moduleName,
    LIMIT_TO_LOAD
} from './config';
import {
    FETCH_LOCATIONS_ERROR,
    SELECT_LOCATION,
    SELECT_LOCATION_SUCCESS
} from "./locations";
import {DBAdapter} from "../../../sync/database";

export const FETCH_LOCATION_POWERLINES = `${appName}/${moduleName}/FETCH_LOCATION_POWERLINES`;
export const FETCH_POWERLINES_OFFLINE = `${appName}/${moduleName}/FETCH_LOCATION_POWERLINES_OFFLINE`;
export const FETCH_LOCATION_POWERLINES_REQUEST = `${appName}/${moduleName}/FETCH_LOCATION_POWERLINES_REQUEST`;
export const FETCH_POWERLINES_OFFLINE_REQUEST = `${appName}/${moduleName}/FETCH_LOCATION_POWERLINES_OFFLINE_REQUEST`;
export const FETCH_LOCATION_POWERLINES_ERROR = `${appName}/${moduleName}/FETCH_LOCATION_POWERLINES_ERROR`;
export const FETCH_LOCATION_POWERLINES_SUCCESS = `${appName}/${moduleName}/FETCH_LOCATION_POWERLINES_SUCCESS`;

export const SELECT_LOCATION_POWERLINES = `${appName}/${moduleName}/SELECT_LOCATION_POWERLINES`;
export const SELECT_LOCATION_POWERLINES_REQUEST = `${appName}/${moduleName}/SELECT_LOCATION_POWERLINES_REQUEST`;
export const SELECT_LOCATION_POWERLINES_ERROR = `${appName}/${moduleName}/SELECT_LOCATION_POWERLINES_ERROR`;
export const SELECT_LOCATION_POWERLINES_SUCCESS = `${appName}/${moduleName}/SELECT_LOCATION_POWERLINES_SUCCESS`;


export function fetchProjectPowerlines(location: any) {
    return {
        type: FETCH_LOCATION_POWERLINES,
        payload: location
    };
}

export function fetchPowerlinesOffline(location: any) {
    return {
        type: FETCH_POWERLINES_OFFLINE,
        payload: location
    }
}

export const fetchProjectPowerlinesSaga = function* (action: any) {
    try {
        yield put({
            type: FETCH_LOCATION_POWERLINES_REQUEST,
        });
        const res = yield call(() => {
                return axios.get(`${API}api/projects/${action.payload.id}/powerlines?limit=${2000}`);
            },
        );
        yield put({
            type: FETCH_LOCATION_POWERLINES_SUCCESS,
            payload: res.data.rows
        });

    } catch (error) {
        yield put({
            type: FETCH_LOCATION_POWERLINES_ERROR,
            error: error.response.data.message,
        });
    }
};

export const fetchPowelinesOfflineSaga = function* (action: any) {
    try {
        yield put({
            type: FETCH_POWERLINES_OFFLINE_REQUEST,
        });
        const query = `SELECT * FROM powerlines WHERE ProjectId = ${action.payload.id}`;
        const dbAdapter = DBAdapter.getInstance();
        const res = yield call(async () => {
            return await dbAdapter.select(query);
        });
        const data = [];
        res.rows._array.forEach((el) => {
            const powerline = {
                ...el,
                title: unescape(el.title),
                comment: unescape(el.comment) === 'null' ? '' : unescape(el.comment),
            };
            data.push(powerline);
        });
        yield put({
            type: FETCH_LOCATION_POWERLINES_SUCCESS,
            payload: data
        });
    } catch (error) {
        yield put({
            type: FETCH_LOCATION_POWERLINES_ERROR,
            error: error.message
        })
    }
};
