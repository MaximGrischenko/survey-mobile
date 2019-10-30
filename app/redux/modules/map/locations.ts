import axios from "react-native-axios";
import {API, appName} from "../../../config";

import {all, cps, call, put, take, takeEvery} from 'redux-saga/effects';
import {
    moduleName,
} from './config';
import {DBAdapter} from "../../../sync/database";

export const FETCH_LOCATIONS = `${appName}/${moduleName}/FETCH_LOCATIONS`;
export const FETCH_LOCATIONS_REQUEST = `${appName}/${moduleName}/FETCH_LOCATIONS_REQUEST`;
export const FETCH_LOCATIONS_ERROR = `${appName}/${moduleName}/FETCH_LOCATIONS_ERROR`;
export const FETCH_LOCATIONS_SUCCESS = `${appName}/${moduleName}/FETCH_LOCATIONS_SUCCESS`;

export const FETCH_LOCATIONS_OFFLINE = `${appName}/${moduleName}/FETCH_LOCATIONS_OFFLINE`;
export const FETCH_LOCATIONS_OFFLINE_REQUEST = `${appName}/${moduleName}/FETCH_LOCATIONS_OFFLINE_REQUEST`;

export const ADD_LOCATIONS = `${appName}/${moduleName}/ADD_LOCATIONS`;
export const ADD_LOCATIONS_REQUEST = `${appName}/${moduleName}/ADD_LOCATIONS_REQUEST`;
export const ADD_LOCATIONS_ERROR = `${appName}/${moduleName}/ADD_LOCATIONS_ERROR`;
export const ADD_LOCATIONS_SUCCESS = `${appName}/${moduleName}/ADD_LOCATIONS_SUCCESS`;
export const SELECT_LOCATION = `${appName}/${moduleName}/SELECT_LOCATION`;
export const SELECT_LOCATION_SUCCESS = `${appName}/${moduleName}/SELECT_LOCATION_SUCCESS`;

export function fetchLocations() {
    return {
        type: FETCH_LOCATIONS,
    };
}

export function fetchLocationsOffline() {
    return {
        type: FETCH_LOCATIONS_OFFLINE,
    }
}

export function selectLocation(payload: any) {
    return {
        type: SELECT_LOCATION,
        payload
    };
}

export function addLocation(data: any) {
    return {
        type: ADD_LOCATIONS,
        payload: data
    };
}

export const fetchLocationsSaga = function* (action: any) {
    try {
        yield put({
            type: FETCH_LOCATIONS_REQUEST,
        });
        const res = yield call(() => {
                return axios.get(`${API}api/projects?limit=1000`);
            },
        );
        yield put({
            type: FETCH_LOCATIONS_SUCCESS,
            payload: res.data
        });
    } catch (error) {
        yield put({
            type: FETCH_LOCATIONS_ERROR,
            error: error.response.data.message,
        });
    }
};

export const fetchLocationsOfflineSaga = function* (action: any) {
    try {
        yield put({
            type: FETCH_LOCATIONS_OFFLINE_REQUEST,
        });

        const query = 'SELECT * FROM projects';
        const dbAdapter = DBAdapter.getInstance();
        const res = yield call(async () => {
            return await dbAdapter.select(query);
        });
        const data = [];
        res.rows._array.forEach((el) => {
            const project = {
                ...el,
                title: unescape(el.title),
                contractor: unescape(el.contractor)
            };
            data.push(project);
        });
        yield put({
          type: FETCH_LOCATIONS_SUCCESS,
          payload: data
        });
    } catch (error) {
        yield put({
          type: FETCH_LOCATIONS_ERROR,
          error: error.message
        })
    }
};

export const addLocationSaga = function* (action: any) {
    try {
        yield put({
            type: ADD_LOCATIONS_REQUEST,
        });
        const res = yield call(() => {
                return axios.post(`${API}api/projects`, action.payload);
            },
        );
        yield put({
            type: ADD_LOCATIONS_SUCCESS,
            payload: res.data
        });

    } catch (error) {
        yield put({
            type: ADD_LOCATIONS_ERROR,
            error: error.response.data.message,
        });
    }
};
export const selectLocationSaga = function* (action: any) {
    try {
        yield put({
            type: SELECT_LOCATION_SUCCESS,
            payload: action.payload
        });

    } catch (error) {

    }
};
