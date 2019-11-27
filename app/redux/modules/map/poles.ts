import axios from "react-native-axios";
import {API, appName} from "../../../config";
import {call, put} from 'redux-saga/effects';
import {LIMIT_TO_LOAD, moduleName} from './config';

import {DBAdapter} from "../../../sync/database";
import {AsyncStorage} from "react-native";

export const ADD_POLE = `${appName}/${moduleName}/ADD_POLE`;
export const ADD_POLE_REQUEST = `${appName}/${moduleName}/ADD_POLE_REQUEST`;
export const ADD_POLE_ERROR = `${appName}/${moduleName}/ADD_POLE_ERROR`;
export const ADD_POLE_SUCCESS = `${appName}/${moduleName}/ADD_POLE_SUCCESS`;

export const EDIT_POLE = `${appName}/${moduleName}/EDIT_POLE`;
export const EDIT_POLE_OFFLINE = `${appName}/${moduleName}/EDIT_POLE_OFFLINE`;
export const EDIT_POLE_REQUEST = `${appName}/${moduleName}/EDIT_POLE_REQUEST`;
export const EDIT_POLE_OFFLINE_REQUEST = `${appName}/${moduleName}/EDIT_POLE_OFFLINE_REQUEST`;
export const EDIT_POLE_ERROR = `${appName}/${moduleName}/EDIT_POLE_ERROR`;
export const EDIT_POLE_SUCCESS = `${appName}/${moduleName}/EDIT_POLE_SUCCESS`;

export const DELETE_POLE = `${appName}/${moduleName}/DELETE_POLE`;
export const DELETE_POLE_REQUEST = `${appName}/${moduleName}/DELETE_POLE_REQUEST`;
export const DELETE_POLE_ERROR = `${appName}/${moduleName}/DELETE_POLE_ERROR`;
export const DELETE_POLE_SUCCESS = `${appName}/${moduleName}/DELETE_POLE_SUCCESS`;

export const FETCH_POLES_OFFLINE = `${appName}/${moduleName}/FETCH_POLES_OFFLINE`;
export const FETCH_LOCATION_POLES = `${appName}/${moduleName}/FETCH_LOCATION_POLES`;
export const FETCH_LOCATION_POLES_REQUEST = `${appName}/${moduleName}/FETCH_LOCATION_POLES_REQUEST`;
export const FETCH_POLES_OFFLINE_REQUEST = `${appName}/${moduleName}/FETCH_POLES_OFFLINE_REQUEST`;
export const FETCH_LOCATION_POLES_ERROR = `${appName}/${moduleName}/FETCH_LOCATION_POLES_ERROR`;
export const FETCH_LOCATION_POLES_SUCCESS = `${appName}/${moduleName}/FETCH_LOCATION_POLES_SUCCESS`;

export function fetchPolesOffline(location: any) {
    return {
        type: FETCH_POLES_OFFLINE,
        payload: location
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

export function editPoleOffline(data: any) {
    return {
        type: EDIT_POLE_OFFLINE,
        payload: data
    }
}

export function deletePole(data: any) {
    return {
        type: DELETE_POLE,
        payload: data
    };
}


export const fetchPolesOfflineSaga = function* (action: any) {
    try {
        yield put({
            type: FETCH_POLES_OFFLINE_REQUEST,
        });
        const query = `SELECT * FROM poles WHERE powerLineId = ${action.payload.powerLineId}`;
        const dbAdapter = DBAdapter.getInstance();
        const res = yield call(async () => {
            return await dbAdapter.select(query);
        });

        const data = [];

        res.rows._array.forEach((el) => {
            const pole = {
                ...el,
                title: unescape(el.title),
                description: unescape(el.description),
                comment: unescape(el.comment) === 'null' ? '' : unescape(el.comment),
                num_slup: unescape(el.num_slup),
                uploads: JSON.parse(unescape(el.uploads)),
                points: JSON.parse(unescape(el.points))
            };
            data.push(pole);
        });
        yield put( {
            type: FETCH_LOCATION_POLES_SUCCESS,
            payload: data
        });
    } catch (error) {
        yield put({
            type: FETCH_LOCATION_POLES_ERROR,
            error: error.message,
        });
    }
};

export const fetchLocationPolesSaga = function* (action: any) {
    try {
        yield put({
            type: FETCH_LOCATION_POLES_REQUEST,
        });
        const res = yield call(() => {
                return axios.get(`${API}api/projects/${action.payload.id}/powerlines/${action.payload.powerLineId}/poles?limit=${LIMIT_TO_LOAD}`);
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
        const response = yield call(() => {
                return axios.put(`${API}api/projects/${action.payload.projectId}/poles/${action.payload.id}`, action.payload);
            },
        );

        if(response.data) {
            const update = `UPDATE poles SET
                title = "${escape(response.data.data.title)}",
                num_slup = "${escape(response.data.data.num_slup)}",
                powerLineId = "${response.data.data.powerLineId}",
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
            type: EDIT_POLE_SUCCESS,
            payload: response.data.data
        });

    } catch (error) {
        yield put({
            type: EDIT_POLE_ERROR,
            error: error.response.data.message,
        });
    }
};

export const editPoleOfflineSaga = function* ({payload}: any) {
    try {
        yield put({
            type: EDIT_POLE_OFFLINE_REQUEST
        });

        const insert = `UPDATE poles SET
            title = "${escape(payload.title)}",
            num_slup = "${escape(payload.num_slup)}",
            powerLineId = "${payload.powerLineId}",
            comment = "${escape(payload.comment)}",
            uploads = "${escape(JSON.stringify(payload.uploads))}",
            updatedAt = ${Date.now()}
        WHERE id = ${payload.id}`;

        const select = `SELECT * FROM poles WHERE id = ${payload.id}`;
        const dbAdapter = DBAdapter.getInstance();
        const res = yield call(async () => {
            return await dbAdapter.insert(insert, select);
        });

        let data = {};
        res.rows._array.forEach((el) => {
            data = {
                ...el,
                title: unescape(el.title),
                num_slup: unescape(el.num_slup),
                powerLineId: el.powerLineId,
                comment: unescape(el.comment) === 'null' ? '' : unescape(el.comment),
                points: JSON.parse(unescape(el.points)),
                uploads: JSON.parse(unescape(el.uploads))
            };
        });

        const update = {
            type: 'pole',
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
            type: EDIT_POLE_SUCCESS,
            payload: data
        });
    } catch (error) {
        yield put({
            type: EDIT_POLE_ERROR,
            error: error.message
        })
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
