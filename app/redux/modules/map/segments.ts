import axios from "react-native-axios";
import {API, appName} from "../../../config";

import {all, cps, call, put, take, takeEvery} from 'redux-saga/effects';
import {
    LIMIT_TO_LOAD,
    moduleName,
} from './config';
import {DBAdapter} from "../../../utils/database";

export const ADD_SEGMENTS = `${appName}/${moduleName}/ADD_SEGMENTS`;
export const ADD_SEGMENTS_REQUEST = `${appName}/${moduleName}/ADD_SEGMENTS_REQUEST`;
export const ADD_SEGMENTS_ERROR = `${appName}/${moduleName}/ADD_SEGMENTS_ERROR`;
export const ADD_SEGMENTS_SUCCESS = `${appName}/${moduleName}/ADD_SEGMENTS_SUCCESS`;


export const EDIT_SEGMENTS = `${appName}/${moduleName}/EDIT_SEGMENTS`;
export const EDIT_SEGMENT_OFFLINE = `${appName}/${moduleName}/EDIT_SEGMENT_OFFLINE`;
export const EDIT_SEGMENTS_REQUEST = `${appName}/${moduleName}/EDIT_SEGMENTS_REQUEST`;
export const EDIT_SEGMENTS_ERROR = `${appName}/${moduleName}/EDIT_SEGMENTS_ERROR`;
export const EDIT_SEGMENTS_SUCCESS = `${appName}/${moduleName}/EDIT_SEGMENTS_SUCCESS`;

export const DELETE_SEGMENTS = `${appName}/${moduleName}/DELETE_SEGMENTS`;
export const DELETE_SEGMENTS_REQUEST = `${appName}/${moduleName}/DELETE_SEGMENTS_REQUEST`;
export const DELETE_SEGMENTS_ERROR = `${appName}/${moduleName}/DELETE_SEGMENTS_ERROR`;
export const DELETE_SEGMENTS_SUCCESS = `${appName}/${moduleName}/DELETE_SEGMENTS_SUCCESS`;


export const FETCH_SEGMENTS_OFFLINE = `${appName}/${moduleName}/FETCH_SEGMENTS_OFFLINE`;
export const FETCH_LOCATION_SEGMENTS = `${appName}/${moduleName}/FETCH_LOCATION_SEGMENTS`;
export const FETCH_LOCATION_SEGMENTS_REQUEST = `${appName}/${moduleName}/FETCH_LOCATION_SEGMENTS_REQUEST`;
export const EDIT_SEGMENT_OFFLINE_REQUEST = `${appName}/${moduleName}/EDIT_SEGMENT_OFFLINE_REQUEST`;
export const FETCH_SEGMENTS_OFFLINE_REQUEST = `${appName}/${moduleName}/FETCH_SEGMENTS_OFFLINE_REQUEST`;
export const FETCH_LOCATION_SEGMENTS_ERROR = `${appName}/${moduleName}/FETCH_LOCATION_SEGMENTS_ERROR`;
export const FETCH_LOCATION_SEGMENTS_SUCCESS = `${appName}/${moduleName}/FETCH_LOCATION_SEGMENTS_SUCCESS`;

export function fetchSegmentsOffline(location: any) {
    return {
        type: FETCH_SEGMENTS_OFFLINE,
        payload: location
    };
}

export function fetchLocationSegments(location: any) {
    return {
        type: FETCH_LOCATION_SEGMENTS,
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

export function editSegmentOffline(data: any) {
    return {
        type: EDIT_SEGMENT_OFFLINE,
        payload: data
    };
}

export function deleteSegments(data: any) {
    return {
        type: DELETE_SEGMENTS,
        payload: data
    };
}

export const fetchSegmentsOfflineSaga = function* (action: any) {
    try {
        yield put({
            type: FETCH_SEGMENTS_OFFLINE_REQUEST,
        });

        const query = `SELECT * FROM segments WHERE powerLineId = ${action.payload.powerLineId}`;

        const res = yield call(async () => {
            return await DBAdapter.getRows(query);
        });

        const data = [];
        res.rows._array.forEach((el) => {
            const segment = {
                ...el,
                title: unescape(el.title),
                comment: unescape(el.comment) === 'null' ? '' : unescape(el.comment),
                description: unescape(el.description),
                nazwa_ciagu_id: unescape(el.nazwa_ciagu_id),
                przeslo: unescape(el.przeslo),
                status: unescape(el.status),
                operation_type: unescape(el.operation_type),
                time_for_next_entry: unescape(el.time_for_next_entry),
                parcel_number_for_permit: unescape(el.parcel_number_for_permit),
                notes: unescape(el.notes),
                points: JSON.parse(unescape(el.points))
            };
            data.push(segment);
        });
        yield put( {
            type: FETCH_LOCATION_SEGMENTS_SUCCESS,
            payload: data
        });
    } catch (error) {
        yield put({
            type: FETCH_LOCATION_SEGMENTS_ERROR,
            error: error.message,
        });
    }
};

export const fetchLocationSegmentSaga = function* (action: any) {
    try {
        yield put({
            type: FETCH_LOCATION_SEGMENTS_REQUEST,
        });
        const res = yield call(() => {
                return axios.get(`${API}api/projects/${action.payload.id}/powerlines/${action.payload.powerLineId}/segments?limit=${LIMIT_TO_LOAD}`);
            },
        );
        yield put({
            type: FETCH_LOCATION_SEGMENTS_SUCCESS,
            payload: res.data.rows
        });

    } catch (error) {
        yield put({
            type: FETCH_LOCATION_SEGMENTS_ERROR,
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
            console.log('API', `${API}api/projects/${action.payload.projectId}/segments/${action.payload.id}`);
            console.log('PAYLOAD', action.payload);
                return axios.put(`${API}api/projects/${action.payload.projectId}/segments/${action.payload.id}`, action.payload);
            },
        );
        console.log('response', res);
        yield put({
            type: EDIT_SEGMENTS_SUCCESS,
            payload: res.data.data
        });

    } catch (error) {
        console.log('error', error);
        yield put({
            type: EDIT_SEGMENTS_ERROR,
            error: error.response.data.message,
        });
    }
};

export const editSegmentOfflineSaga = function* ({payload}: any) {
    try {
        yield put({
            type: EDIT_SEGMENT_OFFLINE_REQUEST
        });
        const update = `UPDATE segments SET
            title = "${escape(payload.title)}",
            comment = "${escape(payload.comment)}",
            nazwa_ciagu_id = "${escape(payload.nazwa_ciagu_id)}",
            przeslo = "${escape(payload.przeslo)}",
            status = "${escape(payload.status)}",
            vegetation_status = "${payload.vegetation_status}",
            distance_lateral = "${payload.distance_lateral}",
            distance_bottom = "${payload.distance_bottom}",
            shutdown_time = "${payload.shutdown_time}",
            operation_type = "${escape(payload.operation_type)}",
            updatedAt = ${Date.now()}
            WHERE id = ${payload.id}`;

        const select = `SELECT * FROM segments WHERE id = ${payload.id}`;

        const res = yield call(async () => {
            return await DBAdapter.setRows(update, select);
        });

        let data = {};

        res.rows._array.forEach((el) => {
            data = {
                ...el,
                title: unescape(el.title),
                nazwa_ciagu_id: unescape(el.nazwa_ciagu_id),
                przeslo: unescape(el.przeslo),
                status: unescape(el.status),
                vegetation_status: el.vegetation_status,
                distance_lateral: el.distance_lateral,
                distance_bottom: el.distance_bottom,
                shutdown_time: el.shutdown_time,
                operation_type: unescape(el.operation_type),
                comment: unescape(el.comment) === 'null' ? '' : unescape(el.comment),
                points: JSON.parse(unescape(el.points))
            };
        });
        yield put({
            type: EDIT_SEGMENTS_SUCCESS,
            payload: data
        })
    } catch (error) {
        yield put({
            type: EDIT_SEGMENTS_ERROR,
            error: error.message
        })
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
