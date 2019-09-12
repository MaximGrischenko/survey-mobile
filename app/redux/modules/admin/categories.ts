import axios from "react-native-axios";
import {API, appName} from "../../../config";

import {all, cps, call, put, take, takeEvery} from 'redux-saga/effects';
import {
    moduleName,
} from './config';

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


export const FETCH_CATEGORYS_MORE = `${appName}/${moduleName}/FETCH_CATEGORYS_MORE`;
export const FETCH_CATEGORYS = `${appName}/${moduleName}/FETCH_CATEGORYS`;
export const FETCH_CATEGORYS_REQUEST = `${appName}/${moduleName}/FETCH_CATEGORYS_REQUEST`;
export const FETCH_CATEGORYS_ERROR = `${appName}/${moduleName}/FETCH_CATEGORYS_ERROR`;
export const FETCH_CATEGORYS_SUCCESS = `${appName}/${moduleName}/FETCH_CATEGORYS_SUCCESS`;

export function fetchMoreCategories(location: any) {
    return {
        type: FETCH_CATEGORYS_MORE,
        payload: location
    };
}

export function fetchCategories(location: any) {
    return {
        type: FETCH_CATEGORYS,
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


export const fetchCategoriesMoreSaga = function* ({payload}: any) {
    yield put({
        type: FETCH_CATEGORYS_SUCCESS,
        payload: payload.rows
    })
};
export const fetchCategoriesSaga = function* (action: any) {
    try {
        yield put({
            type: FETCH_CATEGORYS_REQUEST,
        });
        const res = yield call(() => {
                return axios.get(`${API}api/category`);
            },
        );
        yield put({
            type: FETCH_CATEGORYS_SUCCESS,
            payload: res.data.rows
        });

    } catch (error) {
        yield put({
            type: FETCH_CATEGORYS_ERROR,
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
