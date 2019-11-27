import axios from "react-native-axios";
import {API, appName} from "../../../config";
import {call, put} from 'redux-saga/effects';
import {LIMIT_TO_LOAD, moduleName} from './config';
import {DBAdapter} from "../../../sync/database";
import {AsyncStorage} from "react-native";

export const ADD_POI_OFFLINE = `${appName}/${moduleName}/ADD_POI_OFFLINE`;
export const ADD_POI = `${appName}/${moduleName}/ADD_POI`;
export const ADD_POI_REQUEST = `${appName}/${moduleName}/ADD_POI_REQUEST`;
export const ADD_POI_OFFLINE_REQUEST = `${appName}/${moduleName}/ADD_POI_OFFLINE_REQUEST`;
export const ADD_POI_ERROR = `${appName}/${moduleName}/ADD_POI_ERROR`;
export const ADD_POI_SUCCESS = `${appName}/${moduleName}/ADD_POI_SUCCESS`;

export const FETCH_POIS_OFFLINE = `${appName}/${moduleName}/FETCH_POIS_OFFLINE`;
export const FETCH_LOCATION_POIS = `${appName}/${moduleName}/FETCH_LOCATION_POIS`;
export const FETCH_LOCATION_POIS_REQUEST = `${appName}/${moduleName}/FETCH_LOCATION_POIS_REQUEST`;
export const FETCH_POIS_OFFLINE_REQUEST = `${appName}/${moduleName}/FETCH_POIS_OFFLINE_REQUEST`;
export const FETCH_LOCATION_POIS_ERROR = `${appName}/${moduleName}/FETCH_LOCATION_POIS_ERROR`;
export const FETCH_LOCATION_POIS_SUCCESS = `${appName}/${moduleName}/FETCH_LOCATION_POIS_SUCCESS`;

export const DELETE_POI_OFFLINE = `${appName}/${moduleName}/DELETE_POI_OFFLINE`;
export const POI_DELETE = `${appName}/${moduleName}/POI_DELETE`;
export const DELETE_POI_REQUEST = `${appName}/${moduleName}/DELETE_POI_REQUEST`;
export const DELETE_POI_OFFLINE_REQUEST = `${appName}/${moduleName}/DELETE_POI_OFFLINE_REQUEST`;
export const DELETE_POI_ERROR = `${appName}/${moduleName}/DELETE_POI_ERROR`;
export const POI_DELETE_SUCCESS = `${appName}/${moduleName}/POI_DELETE_SUCCESS`;

export const EDIT_POI_REQUEST = `${appName}/${moduleName}/EDIT_POI_REQUEST`;
export const EDIT_POI_OFFLINE_REQUEST = `${appName}/${moduleName}/EDIT_POI_OFFLINE_REQUEST`;
export const POI_EDIT = `${appName}/${moduleName}/POI_EDIT`;
export const EDIT_POI_OFFLINE = `${appName}/${moduleName}/EDIT_POI_OFFLINE`;
export const POI_EDIT_SUCCESS = `${appName}/${moduleName}/POI_EDIT_SUCCESS`;
export const EDIT_POI_ERROR = `${appName}/${moduleName}/EDIT_POI_ERROR`;

export function fetchPoiOffline(location: any) {
    return {
        type: FETCH_POIS_OFFLINE,
        payload: location
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

export function addPoiOffline(data: any) {
    return {
        type: ADD_POI_OFFLINE,
        payload: data
    }
}

export function removePoi(data: any) {
    return {
        type: POI_DELETE,
        payload: data
    };
}

export function removePoiOffline(data: any) {
    return {
        type: DELETE_POI_OFFLINE,
        payload: data
    }
}

export function editPoi(data: any) {
    return {
        type: POI_EDIT,
        payload: data
    };
}

export function editPoiOffline(data: any) {
    return {
        type: EDIT_POI_OFFLINE,
        payload: data
    }
}

export const fetchPoiOfflineSaga = function* (action: any) {
    try {
        yield put({
            type: FETCH_POIS_OFFLINE_REQUEST
        });
        const query = `SELECT * FROM pois WHERE ProjectId = ${action.payload.id}`;
        const dbAdapter = DBAdapter.getInstance();
        const res = yield call(async () => {
            return await dbAdapter.select(query);
        });

        const data = [];
        res.rows._array.forEach((el) => {
            const poi = {
                ...el,
                title: unescape(el.title),
                description: unescape(el.description),
                uploads: JSON.parse(unescape(el.uploads)),
                comment: unescape(el.comment) === 'null' ? '' : unescape(el.comment),
                points: JSON.parse(unescape(el.points))
            };
            data.push(poi);
        });
        yield put({
            type: FETCH_LOCATION_POIS_SUCCESS,
            payload: data
        });
    } catch (error) {
        yield put({
            type: FETCH_LOCATION_POIS_ERROR,
            error: error.message,
        });
    }
};

export const fetchLocationPoiSaga = function* (action: any) {
    try {
        yield put({
            type: FETCH_LOCATION_POIS_REQUEST,
        });
        const res = yield call(() => {
                return axios.get(`${API}api/projects/${action.payload.id}/poi?limit=${LIMIT_TO_LOAD}`);
            }
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

export const addPoiOfflineSaga = function* ({payload}: any) {
    try {
        yield put({
            type: ADD_POI_OFFLINE_REQUEST
        });

        let id = new Date().getTime();
        id = id & 0xffffffff;

        const insert = `INSERT INTO pois (
            id,
            title,
            points,
            comment,
            userId,
            projectId,
            categoryId,
            uploads,
            createdAt,
            updatedAt,
            deletedAt) VALUES (
            ${id},
            "${escape(payload.title)}", 
            "${escape(JSON.stringify(payload.points))}",
            "${escape(payload.comment)}", 
            ${payload.userId}, 
            ${payload.projectId}, 
            ${payload.categoryId},
            "${escape(JSON.stringify(payload.uploads))}",
            ${Date.now()}, 
            ${Date.now()}, 
            ${null}
        )`;

        const select = `SELECT * FROM pois WHERE id = ${id}`;
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
                comment: unescape(el.comment) === 'undefined' ? '' : unescape(el.comment),
                points: JSON.parse(unescape(el.points)),
                uploads: JSON.parse(unescape(el.uploads))
            };
        });

        const update = {
            type: 'poi',
            action: 'add',
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
            type: ADD_POI_SUCCESS,
            payload: data
        })
    } catch (error) {
        yield put({
            type: ADD_POI_ERROR,
            error: error.message,
        })
    }
};

export const addPoiSaga = function* (action: any) {
    try {
        yield put({
            type: ADD_POI_REQUEST,
        });
        const response = yield call(() => {
                return axios.post(`${API}api/projects/${action.payload.projectId}/poi`, action.payload);
            }
        );

        if(response) {
            const update = `INSERT OR IGNORE INTO pois (
                id,
                title,
                points,
                comment,
                userId,
                projectId,
                categoryId,
                createdAt,
                updatedAt,
                deletedAt) VALUES (
                ${response.data.id},
                "${escape(response.data.title)}", 
                "${escape(JSON.stringify(response.data.points))}",
                "${escape(response.data.comment)}", 
                ${response.data.userId}, 
                ${response.data.projectId}, 
                ${response.data.categoryId},
                ${Date.now()}, 
                ${Date.now()}, 
                ${null}
            )`;

            const dbAdapter = DBAdapter.getInstance();
            const result = yield call(async () => {
                return await dbAdapter.write(update);
            });
            if(result) {
                console.log('Updated', result);
            }
        }

        yield put({
            type: ADD_POI_SUCCESS,
            payload: response.data
        });
    } catch (error) {
        yield put({
            type: ADD_POI_ERROR,
            error: error.response.data.message,
        });
    }
};

export const removePoiOfflineSaga = function* (action: any) {
    try {
        yield put({
            type: DELETE_POI_OFFLINE_REQUEST,
        });

        const clear = `DELETE FROM pois WHERE id = ${action.payload.id}`;
        const dbAdapter = DBAdapter.getInstance();
        const result = yield call(async () => {
            return await dbAdapter.clear(clear);
        });

        const update = {
            type: 'poi',
            action: 'remove',
            data: {
                ...action.payload
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
            type: POI_DELETE_SUCCESS,
            payload: action.payload
        })
    } catch (error) {
        yield put({
            type: DELETE_POI_ERROR,
            error: error.message,
        })
    }
};

export const removePoiSaga = function* (action: any) {
    try {
        yield put({
            type: DELETE_POI_REQUEST,
        });
        const response = yield call(() => {
                return axios.delete(`${API}api/projects/${action.payload.projectId}/poi/${action.payload.id}`,);
            },
        );

        const clear = `DELETE FROM pois WHERE id = ${action.payload.id}`;
        const dbAdapter = DBAdapter.getInstance();
        const result = yield call(async () => {
            return await dbAdapter.clear(clear);
        });

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

export const editPoiSaga = function* (action: any) {
    try {
        yield put({
            type: EDIT_POI_REQUEST,
        });
        const response = yield call(() => {
                return axios.put(`${API}api/projects/${action.payload.projectId}/poi/${action.payload.id}`, action.payload);
            },
        );

        if(response.data) {
            const update = `UPDATE pois SET
                title = "${escape(response.data.data.title)}",
                description = "${escape(response.data.data.description)}",
                projectId = "${response.data.data.projectId}",
                categoryId = "${response.data.data.categoryId}",
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
            type: POI_EDIT_SUCCESS,
            payload: response.data.data
        });

    } catch (error) {
        yield put({
            type: EDIT_POI_ERROR,
            error: error.response.data.message,
        });
    }
};

export const editPoiOfflineSaga = function* ({payload}: any) {
    try {
        yield put({
            type: EDIT_POI_OFFLINE_REQUEST
        });

        const insert = `UPDATE pois SET
            title = "${escape(payload.title)}",
            description = "${escape(payload.description)}",
            projectId = "${payload.projectId}",
            categoryId = "${payload.categoryId}",
            comment = "${escape(payload.comment)}",
            uploads = "${escape(JSON.stringify(payload.uploads))}",
            updatedAt = ${Date.now()}
        WHERE id = ${payload.id}`;

        const select = `SELECT * FROM pois WHERE id = ${payload.id}`;
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
                projectId: el.projectId,
                categoryId: el.categoryId,
                comment: unescape(el.comment) === 'null' ? '' : unescape(el.comment),
                points: JSON.parse(unescape(el.points)),
                uploads: JSON.parse(unescape(el.uploads))
            };
        });

        const update = {
            type: 'poi',
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
            type: POI_EDIT_SUCCESS,
            payload: data
        });

    } catch (error) {
        yield put({
            type: EDIT_POI_ERROR,
            error: error.message
        })
    }
};
