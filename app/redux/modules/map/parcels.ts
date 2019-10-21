import axios from "react-native-axios";
import {API, appName} from "../../../config";

import {all, cps, call, put, take, takeEvery} from 'redux-saga/effects';
import {
    LOADED_PROJECT_DATA,
    moduleName,
    LIMIT_TO_LOAD
} from './config';
import {FETCH_LOCATIONS_OFFLINE_REQUEST} from "./locations";
import {DBAdapter} from "../../../utils/database";

export const ADD_PARCElS = `${appName}/${moduleName}/ADD_PARCElS`;
export const ADD_PARCElS_REQUEST = `${appName}/${moduleName}/ADD_PARCElS_REQUEST`;
export const ADD_PARCElS_ERROR = `${appName}/${moduleName}/ADD_PARCElS_ERROR`;
export const ADD_PARCElS_SUCCESS = `${appName}/${moduleName}/ADD_PARCElS_SUCCESS`;

export const EDIT_PARCElS = `${appName}/${moduleName}/EDIT_PARCElS`;
export const EDIT_PARCEL_OFFLINE = `${appName}/${moduleName}/EDIT_PARCEL_OFFLINE`;
export const EDIT_PARCElS_REQUEST = `${appName}/${moduleName}/EDIT_PARCElS_REQUEST`;
export const EDIT_PARCEL_OFFLINE_REQUEST = `${appName}/${moduleName}/EDIT_PARCEL_OFFLINE_REQUEST`;
export const EDIT_PARCElS_ERROR = `${appName}/${moduleName}/EDIT_PARCElS_ERROR`;
export const EDIT_PARCElS_SUCCESS = `${appName}/${moduleName}/EDIT_PARCElS_SUCCESS`;


export const FETCH_PARCELS_OFFLINE = `${appName}/${moduleName}/FETCH_PARCELS_OFFLINE`;
export const FETCH_LOCATION_PARCElS = `${appName}/${moduleName}/FETCH_LOCATION_PARCElS`;
export const FETCH_LOCATION_PARCElS_REQUEST = `${appName}/${moduleName}/FETCH_LOCATION_PARCElS_REQUEST`;
export const FETCH_PARCELS_OFFLINE_REQUEST = `${appName}/${moduleName}/FETCH_PARCELS_OFFLINE_REQUEST`;
export const FETCH_LOCATION_PARCElS_ERROR = `${appName}/${moduleName}/FETCH_LOCATION_PARCElS_ERROR`;
export const FETCH_LOCATION_PARCElS_SUCCESS = `${appName}/${moduleName}/FETCH_LOCATION_PARCElS_SUCCESS`;


export const DELETE_PARCElS = `${appName}/${moduleName}/DELETE_PARCElS`;
export const DELETE_LOCATION_PARCElS = `${appName}/${moduleName}/DELETE_LOCATION_PARCElS`;
export const DELETE_LOCATION_PARCElS_REQUEST = `${appName}/${moduleName}/DELETE_LOCATION_PARCElS_REQUEST`;
export const DELETE_LOCATION_PARCElS_ERROR = `${appName}/${moduleName}/DELETE_LOCATION_PARCElS_ERROR`;
export const DELETE_LOCATION_PARCElS_SUCCESS = `${appName}/${moduleName}/DELETE_LOCATION_PARCElS_SUCCESS`;

export function fetchLocationParcels(location: any) {
    return {
        type: FETCH_LOCATION_PARCElS,
        payload: location
    };
}

export function addPoleParcel(data: any) {
    return {
        type: ADD_PARCElS,
        payload: data
    };
}

export function editParcel(data: any) {
    return {
        type: EDIT_PARCElS,
        payload: data
    };
}

export function editParcelOffline(data: any) {
    return {
        type: EDIT_PARCEL_OFFLINE,
        payload: data
    }
}

export function deleteParcel(data: any) {
    return {
        type: DELETE_PARCElS,
        payload: data
    };
}

export function fetchParcelsOffline(location: any) {
    return {
        type: FETCH_PARCELS_OFFLINE,
        payload: location
    };
}


export const fetchParcelsOfflineSaga = function* (action: any) {
    try {
        yield put({
            type: FETCH_PARCELS_OFFLINE_REQUEST,
        });

        const query = `SELECT * FROM parcels WHERE powerLineId = ${action.payload.powerLineId}`;

        const res = yield call(async () => {
            return await DBAdapter.getRows(query);
        });

        const data = [];

        res.rows._array.forEach((el) => {
            const parcel = {
                ...el,
                comment: unescape(el.comment) === 'null' ? '' : unescape(el.comment),
                title: unescape(el.title),
                wojewodztw: unescape(el.wojewodztw),
                gmina: unescape(el.gmina),
                description: unescape(el.description),
                numer: unescape(el.numer),
                points: JSON.parse(unescape(el.points))
            };
            data.push(parcel);
        });
        yield put( {
            type: FETCH_LOCATION_PARCElS_SUCCESS,
            payload: data
        });
    } catch (error) {
        yield put({
            type: FETCH_LOCATION_PARCElS_ERROR,
            error: error.message,
        });
    }
};

export const fetchLocationParcelSaga = function* (action: any) {
    try {
        yield put({
            type: FETCH_LOCATION_PARCElS_REQUEST,
        });
        if (!LOADED_PROJECT_DATA.PROJECTS[action.payload.id]) LOADED_PROJECT_DATA.PROJECTS[action.payload.id] = {};
        if (!LOADED_PROJECT_DATA.PROJECTS[action.payload.id].parcels) LOADED_PROJECT_DATA.PROJECTS[action.payload.id].parcels = {startAt: 0};
        const res = yield call(() => {
                return axios.get(`${API}api/projects/${action.payload.id}/powerlines/${action.payload.powerLineId}/parcels?limit=${200}&offset=${LOADED_PROJECT_DATA.PROJECTS[action.payload.id].parcels.startAt}`);
            },
        );
        // if (res.data.length) {
        //     LOADED_PROJECT_DATA.PROJECTS[action.payload.id].parcels.startAt = res.data[res.data.length - 1].id;
        // } else {
        //     LOADED_PROJECT_DATA.PROJECTS[action.payload.id].parcels.startAt = -1;
        // }

        yield put({
            type: FETCH_LOCATION_PARCElS_SUCCESS,
            payload: res.data.rows
        });

    } catch (error) {
        yield put({
            type: FETCH_LOCATION_PARCElS_ERROR,
            error: error.response.data.message,
        });
    }
};
export const addParcelSaga = function* (action: any) {
    try {
        yield put({
            type: ADD_PARCElS_REQUEST,
        });
        const res = yield call(() => {
                return axios.post(`${API}api/projects/${action.payload.locationId}/parcels`, action.payload);
            },
        );
        yield put({
            type: ADD_PARCElS_SUCCESS,
            payload: res.data
        });

    } catch (error) {
        yield put({
            type: ADD_PARCElS_ERROR,
            error: error.response.data.message,
        });
    }
};

export const editParcelSaga = function* (action: any) {
    try {
        yield put({
            type: EDIT_PARCElS_REQUEST,
        });
        const res = yield call(() => {
                return axios.put(`${API}api/projects/${action.payload.projectId}/parcels/${action.payload.id}`, action.payload);
            },
        );
        yield put({
            type: EDIT_PARCElS_SUCCESS,
            payload: res.data.data
        });

    } catch (error) {
        yield put({
            type: EDIT_PARCElS_ERROR,
            error: error.response.data.message,
        });
    }
};

export const editParcelOfflineSaga = function* ({payload}: any) {
    try {
        yield put({
            type: EDIT_PARCEL_OFFLINE_REQUEST
        });
        const update = `UPDATE parcels SET
            title = "${escape(payload.title)}",
            wojewodztw = "${escape(payload.wojewodztw)}",
            numer = "${escape(payload.numer)}",
            status = "${payload.staus}",
            comment = "${escape(payload.comment)}",
            updatedAt = ${Date.now()}
            WHERE id = ${payload.id}`;

        const select = `SELECT * FROM parcels WHERE id = ${payload.id}`;

        const res = yield call(async () => {
            return await DBAdapter.setRows(update, select);
        });

        let data = {};

        res.rows._array.forEach((el) => {
            data = {
                ...el,
                title: unescape(el.title),
                wojewodztw: unescape(el.wojewodztw),
                numer: unescape(el.numer),
                status: el.status,
                comment: unescape(el.comment) === 'null' ? '' : unescape(el.comment),
                points: JSON.parse(unescape(el.points))
            };
        });

        console.log('DATA', data);

        yield put({
            type: EDIT_PARCElS_SUCCESS,
            payload: data
        })
    } catch (error) {
        yield put({
            type: EDIT_PARCElS_ERROR,
            error: error.message
        })
    }
};

export const deleteParcelSaga = function* (action: any) {
    try {
        yield put({
            type: DELETE_LOCATION_PARCElS_REQUEST,
        });
        const res = yield call(() => {
                return axios.delete(`${API}api/projects/${action.payload.projectId}/parcels/${action.payload.id}`);
            },
        );
        yield put({
            type: DELETE_LOCATION_PARCElS_SUCCESS,
            payload: action.payload
        });

    } catch (error) {
        yield put({
            type: DELETE_LOCATION_PARCElS_ERROR,
            error: error.response.data.message,
        });
    }
};
