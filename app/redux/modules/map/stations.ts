import axios from "react-native-axios";
import {API, appName} from "../../../config";
import {all, cps, call, put, take, takeEvery} from 'redux-saga/effects';
import {
    LIMIT_TO_LOAD, LOADED_PROJECT_DATA,
    moduleName,
} from './config';
import {FETCH_LOCATIONS_ERROR} from "./locations";
import {DBAdapter} from "../../../sync/database";
import {AsyncStorage} from "react-native";

export const ADD_STATIONS = `${appName}/${moduleName}/ADD_STATIONS`;
export const ADD_STATIONS_REQUEST = `${appName}/${moduleName}/ADD_STATIONS_REQUEST`;
export const ADD_STATIONS_ERROR = `${appName}/${moduleName}/ADD_STATIONS_ERROR`;
export const ADD_STATIONS_SUCCESS = `${appName}/${moduleName}/ADD_STATIONS_SUCCESS`;


export const EDIT_STATIONS = `${appName}/${moduleName}/EDIT_STATIONS`;
export const EDIT_STATION_OFFLINE = `${appName}/${moduleName}/EDIT_STATION_OFFLINE`;
export const EDIT_STATIONS_REQUEST = `${appName}/${moduleName}/EDIT_STATIONS_REQUEST`;
export const EDIT_STATIONS_OFFLINE_REQUEST = `${appName}/${moduleName}/EDIT_STATIONS_OFFLINE_REQUEST`;
export const EDIT_STATIONS_ERROR = `${appName}/${moduleName}/EDIT_STATIONS_ERROR`;
export const EDIT_STATIONS_SUCCESS = `${appName}/${moduleName}/EDIT_STATIONS_SUCCESS`;

export const DELETE_STATIONS = `${appName}/${moduleName}/DELETE_STATIONS`;
export const DELETE_STATIONS_REQUEST = `${appName}/${moduleName}/DELETE_STATIONS_REQUEST`;
export const DELETE_STATIONS_ERROR = `${appName}/${moduleName}/DELETE_STATIONS_ERROR`;
export const DELETE_STATIONS_SUCCESS = `${appName}/${moduleName}/DELETE_STATIONS_SUCCESS`;

export const FETCH_LOCATION_STATIONS = `${appName}/${moduleName}/FETCH_LOCATION_STATIONS`;
export const FETCH_STATIONS_OFFLINE = `${appName}/${moduleName}/FETCH_STATIONS_OFFLINE`;
export const FETCH_LOCATION_STATIONS_REQUEST = `${appName}/${moduleName}/FETCH_LOCATION_STATIONS_REQUEST`;
export const FETCH_STATIONS_OFFLINE_REQUEST = `${appName}/${moduleName}/FETCH_STATIONS_OFFLINE_REQUEST`;
export const FETCH_LOCATION_STATIONS_ERROR = `${appName}/${moduleName}/FETCH_LOCATION_STATIONS_ERROR`;
export const FETCH_LOCATION_STATIONS_SUCCESS = `${appName}/${moduleName}/FETCH_LOCATION_STATIONS_SUCCESS`;

export const convertToTimeStamp = date => {
    return date ? Date.parse(date) : null;
};

export function fetchLocationStations(location: any) {
    return {
        type: FETCH_LOCATION_STATIONS,
        payload: location
    };
}

export function fetchStationsOffline(location: any) {
    return {
        type: FETCH_STATIONS_OFFLINE,
        payload: location
    }
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

export function editStationOffline(data: any) {
    return {
        type: EDIT_STATION_OFFLINE,
        payload: data
    }
}

export function deleteStation(data: any) {
    return {
        type: DELETE_STATIONS,
        payload: data
    };
}

export const fetchLocationStationSaga = function* (action: any) {
    try {
        yield put({
            type: FETCH_LOCATION_STATIONS_REQUEST,
        });
        if (!LOADED_PROJECT_DATA.PROJECTS[action.payload.id]) LOADED_PROJECT_DATA.PROJECTS[action.payload.id] = {};
        if (!LOADED_PROJECT_DATA.PROJECTS[action.payload.id].stations) LOADED_PROJECT_DATA.PROJECTS[action.payload.id].stations = {startAt: 0};
        const response = yield call(() => {
                return axios.get(`${API}api/projects/${action.payload.id}/stations?limit=${LIMIT_TO_LOAD}&offset=${LOADED_PROJECT_DATA.PROJECTS[action.payload.id].stations.startAt}`);
            },
        );

        yield put({
            type: FETCH_LOCATION_STATIONS_SUCCESS,
            payload: response.data.rows
        });

    } catch (error) {
        yield put({
            type: FETCH_LOCATION_STATIONS_ERROR,
            error: error.response.data.message,
        });
    }
};

export const fetchStationsOfflineSaga = function* (action: any) {
    try {
        yield put({
           type: FETCH_STATIONS_OFFLINE_REQUEST,
        });

        const query = `SELECT * FROM stations WHERE ProjectId = ${action.payload.id}`;
        const dbAdapter = DBAdapter.getInstance();
        const res = yield call(async () => {
            return await dbAdapter.select(query);
        });

        const data = [];
        res.rows._array.forEach((el) => {
            const station = {
                ...el,
                title: unescape(el.title),
                description: unescape(el.description),
                nazw_stac: unescape(el.nazw_stac),
                num_eksp_s: unescape(el.num_eksp_s),
                comment: unescape(el.comment) === 'null' ? '' : unescape(el.comment),
                uploads: JSON.parse(unescape(el.uploads)),
                points: JSON.parse(unescape(el.points))
            };
            data.push(station);
        });
        yield put({
            type: FETCH_LOCATION_STATIONS_SUCCESS,
            payload: data
        });
    } catch (error) {
        yield put({
            type: FETCH_LOCATION_STATIONS_ERROR,
            error: error.message
        })
    }
};

export const addStationSaga = function* (action: any) {
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
        const response = yield call(() => {
                return axios.put(`${API}api/projects/${action.payload.projectId}/stations/${action.payload.id}`, action.payload);
            },
        );

        if(response.data) {
            const update = `UPDATE stations SET
                title = "${escape(response.data.data.title)}",
                nazw_stac = "${escape(response.data.data.nazw_stac)}",
                num_eksp_s = "${escape(response.data.data.num_eksp_s)}",
                comment = "${escape(response.data.data.comment)}",
                updatedAt = ${Date.now()}
            WHERE id = ${response.data.data.id}`;

            const dbAdapter = DBAdapter.getInstance();
            const result = yield call(async () => {
                return await dbAdapter.write(update);
            });

            if(result) {
                console.log('Updated', result);
            }
        }

        yield put({
            type: EDIT_STATIONS_SUCCESS,
            payload: response.data.data
        });

    } catch (error) {
        yield put({
            type: EDIT_STATIONS_ERROR,
            error: error.response.data.message,
        });
    }
};

export const editStationOfflineSaga = function* ({payload}: any) {
    try {
        yield put({
            type: EDIT_STATIONS_OFFLINE_REQUEST
        });

        const insert = `UPDATE stations SET
            title = "${escape(payload.title)}",
            nazw_stac = "${escape(payload.nazw_stac)}",
            num_eksp_s = "${escape(payload.num_eksp_s)}",
            comment = "${escape(payload.comment)}",
            uploads = "${escape(JSON.stringify(payload.uploads))}",
            updatedAt = ${Date.now()}
            WHERE id = ${payload.id}`;

        const select = `SELECT * FROM stations WHERE id = ${payload.id}`;
        const dbAdapter = DBAdapter.getInstance();
        const res = yield call(async () => {
            return await dbAdapter.insert(insert, select);
        });

        let data = {};
        res.rows._array.forEach((el) => {
            data = {
                ...el,
                title: unescape(el.title),
                description: unescape(el.description),
                nazw_stac: unescape(el.nazw_stac),
                num_eksp_s: unescape(el.num_eksp_s),
                comment: unescape(el.comment) === 'null' ? '' : unescape(el.comment),
                points: JSON.parse(unescape(el.points)),
                uploads: JSON.parse(unescape(el.uploads))
            };
        });

        const update = {
            type: 'station',
            action: 'edit',
            data: {
                ...data
            }
        };
        const stored = yield call(async () => {
            return await AsyncStorage.getItem('updates');
        });
        if(!stored) {
            const updates = [];
            updates.push(update);
            yield call(async () => {
                await AsyncStorage.setItem('updates', JSON.stringify(updates));
            });
        } else {
            const updates = JSON.parse(stored);
            updates.push(update);
            yield call(async () => {
                await AsyncStorage.setItem('updates', JSON.stringify(updates));
            });
        }

        yield put({
            type: EDIT_STATIONS_SUCCESS,
            payload: data
        });
    } catch (error) {
        yield put({
            type: EDIT_STATIONS_ERROR,
            error: error.message,
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
