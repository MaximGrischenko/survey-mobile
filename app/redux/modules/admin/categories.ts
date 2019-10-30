import axios from "react-native-axios";
import {API, appName} from "../../../config";

import {all, cps, call, put, take, takeEvery} from 'redux-saga/effects';
import {
    moduleName,
} from './config';
import {DBAdapter} from "../../../sync/database";

export const ADD_CATEGORY = `${appName}/${moduleName}/ADD_CATEGORY`;
export const ADD_CATEGORY_REQUEST = `${appName}/${moduleName}/ADD_CATEGORY_REQUEST`;
export const ADD_CATEGORY_ERROR = `${appName}/${moduleName}/ADD_CATEGORY_ERROR`;
export const ADD_CATEGORY_SUCCESS = `${appName}/${moduleName}/ADD_CATEGORY_SUCCESS`;

export const DELETE_CATEGORY = `${appName}/${moduleName}/DELETE_CATEGORY`;
export const DELETE_CATEGORY_REQUEST = `${appName}/${moduleName}/DELETE_CATEGORY_REQUEST`;
export const DELETE_CATEGORY_SUCCESS = `${appName}/${moduleName}/DELETE_CATEGORY_SUCCESS`;
export const DELETE_CATEGORY_ERROR = `${appName}/${moduleName}/DELETE_CATEGORY_ERROR`;

export const EDIT_CATEGORY = `${appName}/${moduleName}/EDIT_CATEGORY`;
export const EDIT_CATEGORY_REQUEST = `${appName}/${moduleName}/EDIT_CATEGORY_REQUEST`;
export const EDIT_CATEGORY_ERROR = `${appName}/${moduleName}/EDIT_CATEGORY_ERROR`;
export const EDIT_CATEGORY_SUCCESS = `${appName}/${moduleName}/EDIT_CATEGORY_SUCCESS`;


export const FETCH_CATEGORYIES_OFFLINE = `${appName}/${moduleName}/FETCH_CATEGORYIES_OFFLINE`;
export const FETCH_CATEGORIES = `${appName}/${moduleName}/FETCH_CATEGORIES`;
export const FETCH_CATEGORIES_REQUEST = `${appName}/${moduleName}/FETCH_CATEGORIES_REQUEST`;
export const FETCH_CATEGORYIES_OFFLINE_REQUEST = `${appName}/${moduleName}/FETCH_CATEGORYIES_OFFLINE_REQUEST`;
export const FETCH_CATEGORIES_ERROR = `${appName}/${moduleName}/FETCH_CATEGORIES_ERROR`;
export const FETCH_CATEGORIES_SUCCESS = `${appName}/${moduleName}/FETCH_CATEGORIES_SUCCESS`;

export function fetchCategoriesOffline(location: any) {
    return {
        type: FETCH_CATEGORYIES_OFFLINE,
        payload: location
    };
}

export function fetchCategories(location: any) {
    return {
        type: FETCH_CATEGORIES,
        payload: location
    };
}

export function addCategory(data: any) {
    return {
        type: ADD_CATEGORY,
        payload: data
    };
}

export function deleteCategory(data: any) {
    return {
        type: DELETE_CATEGORY,
        payload: data
    };
}

export function editCategory(data: any) {
    return {
        type: EDIT_CATEGORY,
        payload: data
    };
}


export const fetchCategoriesOfflineSaga = function* ({payload}: any) {
    try {
        yield put({
            type: FETCH_CATEGORYIES_OFFLINE_REQUEST,
        });
        const query = `SELECT * FROM categories`;
        const dbAdapter = DBAdapter.getInstance();
        const res = yield call(async () => {
            return await dbAdapter.select(query);
        });
        const data = [];
        res.rows._array.forEach((el) => {
            const powerline = {
                ...el,
                title: unescape(el.title),
                comment: unescape(el.comment) === 'null' ? '' : unescape(el.comment),
            };
            data.push(powerline);
        });
        yield put({
            type: FETCH_CATEGORIES_SUCCESS,
            payload: data
        })
    } catch (error) {
        yield put({
            type: FETCH_CATEGORIES_ERROR,
            error: error.message
        })
    }
};
export const fetchCategoriesSaga = function* (action: any) {
    try {
        yield put({
            type: FETCH_CATEGORIES_REQUEST,
        });
        const res = yield call(() => {
                return axios.get(`${API}api/category`);
            },
        );
        yield put({
            type: FETCH_CATEGORIES_SUCCESS,
            payload: res.data.rows
        });

    } catch (error) {
        yield put({
            type: FETCH_CATEGORIES_ERROR,
            error: error.response.data.message,
        });
    }
};
export const addCategoriesaga = function* (action: any) {
    try {
        yield put({
            type: ADD_CATEGORY_REQUEST,
        });
        const res = yield call(() => {
                return axios.post(`${API}api/admin/category`, action.payload);
            },
        );
        yield put({
            type: ADD_CATEGORY_SUCCESS,
            payload: [res.data]
        });

    } catch (error) {
        yield put({
            type: ADD_CATEGORY_ERROR,
            error: error.response.data,
        });
    }
};
export const editCategoriesaga = function* (action: any) {
    try {
        yield put({
            type: EDIT_CATEGORY_REQUEST,
        });
        const res = yield call(() => {
                return axios.put(`${API}api/admin/category/${action.payload.id}`, action.payload);
            },
        );
        yield put({
            type: EDIT_CATEGORY_SUCCESS,
            payload: res.data.data
        });

    } catch (error) {
        yield put({
            type: EDIT_CATEGORY_ERROR,
            error: error.response.data,
        });
    }
};
export const deleteCategoriesaga = function* (action: any) {
    try {
        yield put({
            type: DELETE_CATEGORY_REQUEST,
        });
        const res = yield call(() => {
                return axios.delete(`${API}api/admin/category/${action.payload.id}`);
            },
        );
        yield put({
            type: DELETE_CATEGORY_SUCCESS,
            payload: action.payload
        });

    } catch (error) {
        yield put({
            type: DELETE_CATEGORY_ERROR,
            error: error.response.data,
        });
    }
};
