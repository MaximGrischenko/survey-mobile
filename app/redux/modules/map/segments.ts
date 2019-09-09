import axios from "react-native-axios";
import {API, appName} from "../../../config";

import {all, cps, call, put, take, takeEvery} from 'redux-saga/effects';
import {
    LIMIT_TO_LOAD,
    moduleName,
} from './config';

export const ADD_SEGMENTS = `${appName}/${moduleName}/ADD_SEGMENTS`;
export const ADD_SEGMENTS_REQUEST = `${appName}/${moduleName}/ADD_SEGMENTS_REQUEST`;
export const ADD_SEGMENTS_ERROR = `${appName}/${moduleName}/ADD_SEGMENTS_ERROR`;
export const ADD_SEGMENTS_SUCCESS = `${appName}/${moduleName}/ADD_SEGMENTS_SUCCESS`;


export const EDIT_SEGMENTS = `${appName}/${moduleName}/EDIT_SEGMENTS`;
export const EDIT_SEGMENTS_REQUEST = `${appName}/${moduleName}/EDIT_SEGMENTS_REQUEST`;
export const EDIT_SEGMENTS_ERROR = `${appName}/${moduleName}/EDIT_SEGMENTS_ERROR`;
export const EDIT_SEGMENTS_SUCCESS = `${appName}/${moduleName}/EDIT_SEGMENTS_SUCCESS`;

export const DELETE_SEGMENTS = `${appName}/${moduleName}/DELETE_SEGMENTS`;
export const DELETE_SEGMENTS_REQUEST = `${appName}/${moduleName}/DELETE_SEGMENTS_REQUEST`;
export const DELETE_SEGMENTS_ERROR = `${appName}/${moduleName}/DELETE_SEGMENTS_ERROR`;
export const DELETE_SEGMENTS_SUCCESS = `${appName}/${moduleName}/DELETE_SEGMENTS_SUCCESS`;


export const FETCH_LOCATION_SEGMENTSS_MORE = `${appName}/${moduleName}/FETCH_LOCATION_SEGMENTSS_MORE`;
export const FETCH_LOCATION_SEGMENTSS = `${appName}/${moduleName}/FETCH_LOCATION_SEGMENTSS`;
export const FETCH_LOCATION_SEGMENTSS_REQUEST = `${appName}/${moduleName}/FETCH_LOCATION_SEGMENTSS_REQUEST`;
export const FETCH_LOCATION_SEGMENTSS_ERROR = `${appName}/${moduleName}/FETCH_LOCATION_SEGMENTSS_ERROR`;
export const FETCH_LOCATION_SEGMENTSS_SUCCESS = `${appName}/${moduleName}/FETCH_LOCATION_SEGMENTSS_SUCCESS`;

export function fetchLocationMoreSegments(location: any) {
    return {
        type: FETCH_LOCATION_SEGMENTSS_MORE,
        payload: location
    };
}

export function fetchLocationSegments(location: any) {
    return {
        type: FETCH_LOCATION_SEGMENTSS,
        payload: location
    };
}

export function addSegments(data: any) {
    return {
        type: ADD_SEGMENTS,
        payload: data
    };
}

export function editSegments(data: any) {
    return {
        type: EDIT_SEGMENTS,
        payload: data
    };
}

export function deleteSegments(data: any) {
    return {
        type: DELETE_SEGMENTS,
        payload: data
    };
}


export const fetchLocationSegmentMoreSaga = function* ({payload}: any) {
    yield put({
        type: FETCH_LOCATION_SEGMENTSS_SUCCESS,
        payload: payload.rows
    });
}
export const fetchLocationSegmentSaga = function* (action: any) {
    try {
        yield put({
            type: FETCH_LOCATION_SEGMENTSS_REQUEST,
        });
        const res = yield call(() => {
                return axios.get(`${API}api/projects/${action.payload.id}/powerlines/${action.payload.powerLineId}/segments?limit=${LIMIT_TO_LOAD}`);
            },
        );
        yield put({
            type: FETCH_LOCATION_SEGMENTSS_SUCCESS,
            payload: res.data.rows
        });

    } catch (error) {
        yield put({
            type: FETCH_LOCATION_SEGMENTSS_ERROR,
            error: error.response.data.message,
        });
    }
};
export const addSegmentSaga = function* (action: any) {
    try {
        yield put({
            type: ADD_SEGMENTS_REQUEST,
        });
        const res = yield call(() => {
                return axios.post(`${API}api/projects/${action.payload.locationId}/segments`, action.payload);
            },
        );
        yield put({
            type: ADD_SEGMENTS_SUCCESS,
            payload: res.data
        });

    } catch (error) {
        yield put({
            type: ADD_SEGMENTS_ERROR,
            error: error.response.data.message,
        });
    }
};

export const editItemSaga = function* (action: any) {
    try {
        yield put({
            type: EDIT_SEGMENTS_REQUEST,
        });
        const res = yield call(() => {
                return axios.put(`${API}api/projects/${action.payload.projectId}/segments/${action.payload.id}`, action.payload);
            },
        );
        yield put({
            type: EDIT_SEGMENTS_SUCCESS,
            payload: res.data.data
        });

    } catch (error) {
        yield put({
            type: EDIT_SEGMENTS_ERROR,
            error: error.response.data.message,
        });
    }
};
export const deleteItemSaga = function* (action: any) {
    try {
        yield put({
            type: DELETE_SEGMENTS_REQUEST,
        });
        const res = yield call(() => {
                return axios.delete(`${API}api/projects/${action.payload.projectId}/segments/${action.payload.id}`);
            },
        );
        yield put({
            type: DELETE_SEGMENTS_SUCCESS,
            payload: action.payload
        });

    } catch (error) {
        yield put({
            type: DELETE_SEGMENTS_ERROR,
            error: error.response.data.message,
        });
    }
};
