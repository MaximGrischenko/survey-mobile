import axios from "react-native-axios";
import {API, appName} from "../../../config";

import {all, cps, call, put, take, takeEvery} from 'redux-saga/effects';
import {
    LOADED_PROJECT_DATA,
    moduleName,
    LIMIT_TO_LOAD
} from './config';
import {SELECT_LOCATION, SELECT_LOCATION_SUCCESS} from "./locations";


export const FETCH_LOCATION_POWERLINES = `${appName}/${moduleName}/FETCH_LOCATION_POWERLINES`;
export const FETCH_LOCATION_POWERLINES_REQUEST = `${appName}/${moduleName}/FETCH_LOCATION_POWERLINES_REQUEST`;
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
/*

export function selectProjectPowerline(data: any) {
    return {
        type: SELECT_LOCATION_POWERLINES,
        payload: data
    };
}
*/


export const fetchProjectPowerlinesSaga = function* (action: any) {
    try {
        yield put({
            type: FETCH_LOCATION_POWERLINES_REQUEST,
        });
        const res = yield call(() => {
            console.log('URL', `${API}api/projects/${action.payload.id}/powerlines?limit=${2000}`);
                return axios.get(`${API}api/projects/${action.payload.id}/powerlines?limit=${2000}`);
            },
        );
            console.log('RESPONSE', res.data.rows.length);
        yield put({
            type: FETCH_LOCATION_POWERLINES_SUCCESS,
            payload: res.data.rows
        });

    } catch (error) {
        console.log('ERROR', error);
        yield put({
            type: FETCH_LOCATION_POWERLINES_ERROR,
            error: error.response.data.message,
        });
    }
};
/*
export const selectProjectPowerlineSaga = function* (action: any) {
    try {

        yield put({
            type: SELECT_LOCATION_POWERLINES_SUCCESS,
            payload: action.payload
        });

    } catch (error) {

    }
};
*/
