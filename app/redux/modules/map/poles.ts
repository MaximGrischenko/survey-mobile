import axios from "react-native-axios";
import {API, appName} from "../../../config";

import {all, cps, call, put, take, takeEvery} from 'redux-saga/effects';
import {
    LIMIT_TO_LOAD,
    moduleName,
} from './config';

import {
    DELETE_SEGMENTS_ERROR,
    DELETE_SEGMENTS_REQUEST,
    DELETE_SEGMENTS_SUCCESS,
    EDIT_SEGMENTS_ERROR,
    EDIT_SEGMENTS_REQUEST,
    EDIT_SEGMENTS_SUCCESS
} from "./segments";

export const ADD_POLE = `${appName}/${moduleName}/ADD_POLE`;
export const ADD_POLE_REQUEST = `${appName}/${moduleName}/ADD_POLE_REQUEST`;
export const ADD_POLE_ERROR = `${appName}/${moduleName}/ADD_POLE_ERROR`;
export const ADD_POLE_SUCCESS = `${appName}/${moduleName}/ADD_POLE_SUCCESS`;


export const EDIT_POLE = `${appName}/${moduleName}/EDIT_POLE`;
export const EDIT_POLE_REQUEST = `${appName}/${moduleName}/EDIT_POLE_REQUEST`;
export const EDIT_POLE_ERROR = `${appName}/${moduleName}/EDIT_POLE_ERROR`;
export const EDIT_POLE_SUCCESS = `${appName}/${moduleName}/EDIT_POLE_SUCCESS`;

export const DELETE_POLE = `${appName}/${moduleName}/DELETE_POLE`;
export const DELETE_POLE_REQUEST = `${appName}/${moduleName}/DELETE_POLE_REQUEST`;
export const DELETE_POLE_ERROR = `${appName}/${moduleName}/DELETE_POLE_ERROR`;
export const DELETE_POLE_SUCCESS = `${appName}/${moduleName}/DELETE_POLE_SUCCESS`;


export const FETCH_LOCATION_POLES_MORE = `${appName}/${moduleName}/FETCH_LOCATION_POLES_MORE`;
export const FETCH_LOCATION_POLES = `${appName}/${moduleName}/FETCH_LOCATION_POLES`;
export const FETCH_LOCATION_POLES_REQUEST = `${appName}/${moduleName}/FETCH_LOCATION_POLES_REQUEST`;
export const FETCH_LOCATION_POLES_ERROR = `${appName}/${moduleName}/FETCH_LOCATION_POLES_ERROR`;
export const FETCH_LOCATION_POLES_SUCCESS = `${appName}/${moduleName}/FETCH_LOCATION_POLES_SUCCESS`;

export function fetchLocationMorePoles(data: any) {
    return {
        type: FETCH_LOCATION_POLES_MORE,
        payload: data
    };
}

export function fetchLocationPoles(location: any) {
    return {
        type: FETCH_LOCATION_POLES,
        payload: location
    };
}

export function addPole(data: any) {
    return {
        type: ADD_POLE,
        payload: data
    };
}

export function editPole(data: any) {
    return {
        type: EDIT_POLE,
        payload: data
    };
}

export function deletePole(data: any) {
    return {
        type: DELETE_POLE,
        payload: data
    };
}


export const fetchLocationMorePolesSaga = function* ({payload}: any) {
    yield put({
        type: FETCH_LOCATION_POLES_SUCCESS,
        payload: payload.rows
    });
};

export const fetchLocationPolesSaga = function* (action: any) {
    try {
        yield put({
            type: FETCH_LOCATION_POLES_REQUEST,
        });
        const res = yield call(() => {
                return axios.get(`${API}api/projects/${action.payload.id}/powerlines/${action.payload.powerLineId}/poles?limit=${200}`);
            },
        );
        yield put({
            type: FETCH_LOCATION_POLES_SUCCESS,
            payload: res.data.rows
        });

    } catch (error) {
        yield put({
            type: FETCH_LOCATION_POLES_ERROR,
            error: error.response.data.message,
        });
    }
};
export const addPoleSaga = function* (action: any) {
    try {
        yield put({
            type: ADD_POLE_REQUEST,
        });
        const res = yield call(() => {
                return axios.post(`${API}api/poles`, action.payload);
            },
        );
        yield put({
            type: ADD_POLE_SUCCESS,
            payload: res.data
        });

    } catch (error) {
        yield put({
            type: ADD_POLE_ERROR,
            error: error.response.data.message,
        });
    }
};
export const editItemSaga = function* (action: any) {
    try {
        yield put({
            type: EDIT_POLE_REQUEST,
        });
        const res = yield call(() => {
                return axios.put(`${API}api/projects/${action.payload.projectId}/poles/${action.payload.id}`, action.payload);
            },
        );
        yield put({
            type: EDIT_POLE_SUCCESS,
            payload: res.data.data
        });

    } catch (error) {
        yield put({
            type: EDIT_POLE_ERROR,
            error: error.response.data.message,
        });
    }
};
export const deleteParcelSaga = function* (action: any) {
    try {
        yield put({
            type: DELETE_POLE_REQUEST,
        });
        const res = yield call(() => {
                return axios.delete(`${API}api/projects/${action.payload.projectId}/poles/${action.payload.id}`);
            },
        );
        yield put({
            type: DELETE_POLE_SUCCESS,
            payload: action.payload
        });

    } catch (error) {
        yield put({
            type: DELETE_POLE_ERROR,
            error: error.response.data.message,
        });
    }
};
