import axios from "react-native-axios";
import {API, appName} from "../../../config";
import {all, cps, call, put, take, takeEvery} from 'redux-saga/effects';
import {
    LIMIT_TO_LOAD, LOADED_PROJECT_DATA,
    moduleName,
} from './config';
import {
    DELETE_POLE_ERROR,
    DELETE_POLE_REQUEST,
    DELETE_POLE_SUCCESS,
    EDIT_POLE_ERROR,
    EDIT_POLE_REQUEST,
    EDIT_POLE_SUCCESS
} from "./poles";

export const ADD_STATIONS = `${appName}/${moduleName}/ADD_STATIONS`;
export const ADD_STATIONS_REQUEST = `${appName}/${moduleName}/ADD_STATIONS_REQUEST`;
export const ADD_STATIONS_ERROR = `${appName}/${moduleName}/ADD_STATIONS_ERROR`;
export const ADD_STATIONS_SUCCESS = `${appName}/${moduleName}/ADD_STATIONS_SUCCESS`;


export const EDIT_STATIONS = `${appName}/${moduleName}/EDIT_STATIONS`;
export const EDIT_STATIONS_REQUEST = `${appName}/${moduleName}/EDIT_STATIONS_REQUEST`;
export const EDIT_STATIONS_ERROR = `${appName}/${moduleName}/EDIT_STATIONS_ERROR`;
export const EDIT_STATIONS_SUCCESS = `${appName}/${moduleName}/EDIT_STATIONS_SUCCESS`;

export const DELETE_STATIONS = `${appName}/${moduleName}/DELETE_STATIONS`;
export const DELETE_STATIONS_REQUEST = `${appName}/${moduleName}/DELETE_STATIONS_REQUEST`;
export const DELETE_STATIONS_ERROR = `${appName}/${moduleName}/DELETE_STATIONS_ERROR`;
export const DELETE_STATIONS_SUCCESS = `${appName}/${moduleName}/DELETE_STATIONS_SUCCESS`;


export const FETCH_LOCATION_MORE_STATIONSS = `${appName}/${moduleName}/FETCH_LOCATION_MORE_STATIONSS`;
export const FETCH_LOCATION_STATIONSS = `${appName}/${moduleName}/FETCH_LOCATION_STATIONSS`;
export const FETCH_LOCATION_STATIONSS_REQUEST = `${appName}/${moduleName}/FETCH_LOCATION_STATIONSS_REQUEST`;
export const FETCH_LOCATION_STATIONSS_ERROR = `${appName}/${moduleName}/FETCH_LOCATION_STATIONSS_ERROR`;
export const FETCH_LOCATION_STATIONSS_SUCCESS = `${appName}/${moduleName}/FETCH_LOCATION_STATIONSS_SUCCESS`;

export function fetchLocationStations(location: any) {
    return {
        type: FETCH_LOCATION_STATIONSS,
        payload: location
    };
}

export function fetchLocationMOREStations(location: any) {
    return {
        type: FETCH_LOCATION_MORE_STATIONSS,
        payload: location
    };
}

export function addStation(data: any) {
    return {
        type: ADD_STATIONS,
        payload: data
    };
}

export function editStation(data: any) {
    return {
        type: EDIT_STATIONS,
        payload: data
    };
}

export function deleteStation(data: any) {
    return {
        type: DELETE_STATIONS,
        payload: data
    };
}


export const fetchLocationMoreStationsaga = function* ({payload}: any) {
    yield put({
        type: FETCH_LOCATION_STATIONSS_SUCCESS,
        payload: payload.rows
    });
};

export const fetchLocationStationsaga = function* (action: any) {
    try {
        yield put({
            type: FETCH_LOCATION_STATIONSS_REQUEST,
        });
        if (!LOADED_PROJECT_DATA.PROJECTS[action.payload.id]) LOADED_PROJECT_DATA.PROJECTS[action.payload.id] = {};
        if (!LOADED_PROJECT_DATA.PROJECTS[action.payload.id].stations) LOADED_PROJECT_DATA.PROJECTS[action.payload.id].stations = {startAt: 0};
        const res = yield call(() => {
                return axios.get(`${API}api/projects/${action.payload.id}/stations?limit=${LIMIT_TO_LOAD}&offset=${LOADED_PROJECT_DATA.PROJECTS[action.payload.id].stations.startAt}`);
            },
        );
        yield put({
            type: FETCH_LOCATION_STATIONSS_SUCCESS,
            payload: res.data.rows
        });

    } catch (error) {
        yield put({
            type: FETCH_LOCATION_STATIONSS_ERROR,
            error: error.response.data.message,
        });
    }
};
export const addStationsaga = function* (action: any) {
    try {
        yield put({
            type: ADD_STATIONS_REQUEST,
        });
        const res = yield call(() => {
                return axios.post(`${API}api/projects/${action.payload.locationId}/stations`, action.payload);
            },
        );
        yield put({
            type: ADD_STATIONS_SUCCESS,
            payload: res.data
        });

    } catch (error) {
        yield put({
            type: ADD_STATIONS_ERROR,
            error: error.response.data.message,
        });
    }
};

export const editItemSaga = function* (action: any) {
    try {
        yield put({
            type: EDIT_STATIONS_REQUEST,
        });
        const res = yield call(() => {
                return axios.put(`${API}api/projects/${action.payload.projectId}/stations/${action.payload.id}`, action.payload);
            },
        );
        yield put({
            type: EDIT_STATIONS_SUCCESS,
            payload: res.data.data
        });

    } catch (error) {
        yield put({
            type: EDIT_STATIONS_ERROR,
            error: error.response.data.message,
        });
    }
};
export const deleteItemSaga = function* (action: any) {
    try {
        yield put({
            type: DELETE_STATIONS_REQUEST,
        });
        const res = yield call(() => {
                return axios.delete(`${API}api/projects/${action.payload.projectId}/stations/${action.payload.id}`);
            },
        );
        yield put({
            type: DELETE_STATIONS_SUCCESS,
            payload: action.payload
        });

    } catch (error) {
        yield put({
            type: DELETE_STATIONS_ERROR,
            error: error.response.data.message,
        });
    }
};
