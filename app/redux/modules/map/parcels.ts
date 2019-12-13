import axios from "react-native-axios";
import {API, appName} from "../../../config";
import {call, put} from 'redux-saga/effects';
import {LIMIT_TO_LOAD, LOADED_PROJECT_DATA, moduleName} from './config';
import {DBAdapter} from "../../../sync/database";
import {AsyncStorage} from "react-native";

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
        const dbAdapter = DBAdapter.getInstance();
        const res = yield call(async () => {
            return await dbAdapter.select(query);
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
                ownership: unescape(el.ownership),
                numer: unescape(el.numer),
                uploads: JSON.parse(unescape(el.uploads)),
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
                return axios.get(`${API}api/projects/${action.payload.id}/powerlines/${action.payload.powerLineId}/parcels?limit=${LIMIT_TO_LOAD}`);
            },
        );

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
        const response = yield call(() => {
                return axios.put(`${API}api/projects/${action.payload.projectId}/parcels/${action.payload.id}`, action.payload);
            },
        );

        if(response.data) {
            const update = `UPDATE parcels SET
                title = "${escape(response.data.data.title)}",
                wojewodztw = "${escape(response.data.data.wojewodztw)}",
                ownership = "${escape(response.data.data.ownership)}",
                numer = "${escape(response.data.data.numer)}",
                status = "${response.data.data.status}",
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
            type: EDIT_PARCElS_SUCCESS,
            payload: response.data.data
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
        const insert = `UPDATE parcels SET
            title = "${escape(payload.title)}",
            wojewodztw = "${escape(payload.wojewodztw)}",
            ownership = "${escape(payload.ownership)}",
            numer = "${escape(payload.numer)}",
            status = "${payload.status}",
            comment = "${escape(payload.comment)}",
            uploads = "${escape(JSON.stringify(payload.uploads))}",
            updatedAt = ${Date.now()}
            WHERE id = ${payload.id}`;

        const select = `SELECT * FROM parcels WHERE id = ${payload.id}`;
        const dbAdapter = DBAdapter.getInstance();
        const res = yield call(async () => {
            return await dbAdapter.insert(insert, select);
        });

        let data = {};
        res.rows._array.forEach((el) => {
            data = {
                ...el,
                title: unescape(el.title),
                wojewodztw: unescape(el.wojewodztw),
                ownership: unescape(el.ownership),
                numer: unescape(el.numer),
                status: el.status,
                comment: unescape(el.comment) === 'null' ? '' : unescape(el.comment),
                points: JSON.parse(unescape(el.points)),
                uploads: JSON.parse(unescape(el.uploads))
            };
        });

        const update = {
            type: 'parcel',
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
