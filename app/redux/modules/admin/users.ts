import axios from "react-native-axios";
import {API, appName} from "../../../config";

import {all, cps, call, put, take, takeEvery} from 'redux-saga/effects';
import {
    moduleName,
} from './config';

export const ADD_USER = `${appName}/${moduleName}/ADD_USER`;
export const ADD_USER_REQUEST = `${appName}/${moduleName}/ADD_USER_REQUEST`;
export const ADD_USER_ERROR = `${appName}/${moduleName}/ADD_USER_ERROR`;
export const ADD_USER_SUCCESS = `${appName}/${moduleName}/ADD_USER_SUCCESS`;

export const DELETE_USER = `${appName}/${moduleName}/DELETE_USER`;
export const DELETE_USER_REQUEST = `${appName}/${moduleName}/DELETE_USER_REQUEST`;
export const DELETE_USER_SUCCESS = `${appName}/${moduleName}/DELETE_USER_SUCCESS`;
export const DELETE_USER_ERROR = `${appName}/${moduleName}/DELETE_USER_ERROR`;

export const EDIT_USER = `${appName}/${moduleName}/EDIT_USER`;
export const EDIT_USER_REQUEST = `${appName}/${moduleName}/EDIT_USER_REQUEST`;
export const EDIT_USER_ERROR = `${appName}/${moduleName}/EDIT_USER_ERROR`;
export const EDIT_USER_SUCCESS = `${appName}/${moduleName}/EDIT_USER_SUCCESS`;


export const FETCH_USERS_MORE = `${appName}/${moduleName}/FETCH_USERS_MORE`;
export const FETCH_USERS = `${appName}/${moduleName}/FETCH_USERS`;
export const FETCH_USERS_REQUEST = `${appName}/${moduleName}/FETCH_USERS_REQUEST`;
export const FETCH_USERS_ERROR = `${appName}/${moduleName}/FETCH_USERS_ERROR`;
export const FETCH_USERS_SUCCESS = `${appName}/${moduleName}/FETCH_USERS_SUCCESS`;

export function fetchMoreUsers(location: any) {
    return {
        type: FETCH_USERS_MORE,
        payload: location
    };
}

export function fetchUsers(location: any) {
    return {
        type: FETCH_USERS,
        payload: location
    };
}

export function addUser(data: any) {
    return {
        type: ADD_USER,
        payload: data
    };
}

export function deleteUser(data: any) {
    return {
        type: DELETE_USER,
        payload: data
    };
}

export function editUser(data: any) {
    return {
        type: EDIT_USER,
        payload: data
    };
}


export const fetchUsersMoreSaga = function* ({payload}: any) {
    yield put({
        type: FETCH_USERS_SUCCESS,
        payload: payload.rows
    })
}
export const fetchUsersSaga = function* (action: any) {
    try {
        yield put({
            type: FETCH_USERS_REQUEST,
        });
        const res = yield call(() => {
                return axios.get(`${API}api/admin/user`);
            },
        );
        yield put({
            type: FETCH_USERS_SUCCESS,
            payload: res.data.rows
        });

    } catch (error) {
        yield put({
            type: FETCH_USERS_ERROR,
            error: error.response.data.message,
        });
    }
};
export const addUserSaga = function* (action: any) {
    try {
        yield put({
            type: ADD_USER_REQUEST,
        });
        const res = yield call(() => {
                return axios.post(`${API}api/admin/user`, action.payload);
            },
        );
        yield put({
            type: ADD_USER_SUCCESS,
            payload: [res.data]
        });

    } catch (error) {
        yield put({
            type: ADD_USER_ERROR,
            error: error.response.data,
        });
    }
};
export const editUserSaga = function* (action: any) {
    try {
        yield put({
            type: EDIT_USER_REQUEST,
        });
        const res = yield call(() => {
                return axios.put(`${API}api/admin/user/${action.payload.id}`, action.payload);
            },
        );
        yield put({
            type: EDIT_USER_SUCCESS,
            payload: res.data.data
        });

    } catch (error) {
        yield put({
            type: EDIT_USER_ERROR,
            error: error.response.data,
        });
    }
};
export const deleteUserSaga = function* (action: any) {
    try {
        yield put({
            type: DELETE_USER_REQUEST,
        });
        const res = yield call(() => {
                return axios.delete(`${API}api/admin/user/${action.payload.id}`);
            },
        );
        yield put({
            type: DELETE_USER_SUCCESS,
            payload: action.payload
        });

    } catch (error) {
        yield put({
            type: DELETE_USER_ERROR,
            error: error.response.data,
        });
    }
};
