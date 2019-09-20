import axios from "react-native-axios";
import {API, appName} from "../../../config";

import {all, cps, call, put, take, takeEvery} from 'redux-saga/effects';
import {
    LIMIT_TO_LOAD,
    moduleName,
} from './config';

export const ADD_POI = `${appName}/${moduleName}/ADD_POI`;
export const ADD_POI_REQUEST = `${appName}/${moduleName}/ADD_POI_REQUEST`;
export const ADD_POI_ERROR = `${appName}/${moduleName}/ADD_POI_ERROR`;
export const ADD_POI_SUCCESS = `${appName}/${moduleName}/ADD_POI_SUCCESS`;


export const FETCH_LOCATION_POIS_MORE = `${appName}/${moduleName}/FETCH_LOCATION_POIS_MORE`;
export const FETCH_LOCATION_POIS = `${appName}/${moduleName}/FETCH_LOCATION_POIS`;
export const FETCH_LOCATION_POIS_REQUEST = `${appName}/${moduleName}/FETCH_LOCATION_POIS_REQUEST`;
export const FETCH_LOCATION_POIS_ERROR = `${appName}/${moduleName}/FETCH_LOCATION_POIS_ERROR`;
export const FETCH_LOCATION_POIS_SUCCESS = `${appName}/${moduleName}/FETCH_LOCATION_POIS_SUCCESS`;


export const DELETE_POI_REQUEST = `${appName}/${moduleName}/DELETE_POI_REQUEST`;
export const DELETE_POI_ERROR = `${appName}/${moduleName}/DELETE_POI_ERROR`;
export const POI_DELETE_SUCCESS = `${appName}/${moduleName}/POI_DELETE_SUCCESS`;
export const POI_DELETE = `${appName}/${moduleName}/POI_DELETE`;


export const EDIT_POI_REQUEST = `${appName}/${moduleName}/EDIT_POI_REQUEST`;
export const POI_EDIT = `${appName}/${moduleName}/POI_EDIT`;
export const POI_EDIT_SUCCESS = `${appName}/${moduleName}/POI_EDIT_SUCCESS`;
export const EDIT_POI_ERROR = `${appName}/${moduleName}/EDIT_POI_ERROR`;

export function fetchLocationMorePoi(data: any) {
    return {
        type: FETCH_LOCATION_POIS_MORE,
        payload: data
    };
}

export function fetchLocationPoi(location: any) {
    return {
        type: FETCH_LOCATION_POIS,
        payload: location
    };
}

export function addPoi(data: any) {
    return {
        type: ADD_POI,
        payload: data
    };
}

export function removePoi(data: any) {
    return {
        type: POI_DELETE,
        payload: data
    };
}

export function editPoi(data: any) {
    return {
        type: POI_EDIT,
        payload: data
    };
}


export const fetchLocationPoiMoresaga = function* ({payload}: any) {
    yield put({
        type: FETCH_LOCATION_POIS_SUCCESS,
        payload: payload.rows
    });

}
export const fetchLocationPoisaga = function* (action: any) {
    try {
        yield put({
            type: FETCH_LOCATION_POIS_REQUEST,
        });
        const res = yield call(() => {
                return axios.get(`${API}api/projects/${action.payload.id}/poi?limit=${LIMIT_TO_LOAD}`);
            },
        );
        yield put({
            type: FETCH_LOCATION_POIS_SUCCESS,
            payload: res.data.rows
        });
    } catch (error) {
        yield put({
            type: FETCH_LOCATION_POIS_ERROR,
            error: error.response.data.message,
        });
    }
};
export const addPoisaga = function* (action: any) {
    try {
        yield put({
            type: ADD_POI_REQUEST,
        });
        const res = yield call(() => {
                return axios.post(`${API}api/projects/${action.payload.projectId}/poi`, action.payload);
            },
        );
        yield put({
            type: ADD_POI_SUCCESS,
            payload: res.data
        });

    } catch (error) {
        yield put({
            type: ADD_POI_ERROR,
            error: error.response.data.message,
        });
    }
};
export const removePoisaga = function* (action: any) {
    try {
        yield put({
            type: DELETE_POI_REQUEST,
        });
        const res = yield call(() => {
                return axios.delete(`${API}api/projects/${action.payload.projectId}/poi/${action.payload.id}`,);
            },
        );
        yield put({
            type: POI_DELETE_SUCCESS,
            payload: action.payload
        });

    } catch (error) {
        yield put({
            type: DELETE_POI_ERROR,
            error: error.response.data.message,
        });
    }
};
export const editPoisaga = function* (action: any) {
    try {
        yield put({
            type: EDIT_POI_REQUEST,
        });
        const res = yield call(() => {
            console.log('payload', action.payload);
                return axios.put(`${API}api/projects/${action.payload.projectId}/poi/${action.payload.id}`, action.payload);
            },
        );
        console.log('res', res);
        yield put({
            type: POI_EDIT_SUCCESS,
            payload: res.data.data
        });

    } catch (error) {
        yield put({
            type: EDIT_POI_ERROR,
            error: error.response.data.message,
        });
    }
};
