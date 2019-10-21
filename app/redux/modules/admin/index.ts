import {API, appName} from '../../../config';
import {Record} from 'immutable';
import {all, cps, call, put, take, takeEvery} from 'redux-saga/effects';
import {createSelector} from 'reselect';
import {SIGN_OUT_SUCCESS} from '../auth';
import {
    ADD_USER,
    ADD_USER_ERROR,
    ADD_USER_REQUEST,
    ADD_USER_SUCCESS,
    addUserSaga,
    DELETE_USER,
    DELETE_USER_ERROR,
    DELETE_USER_REQUEST, DELETE_USER_SUCCESS,
    deleteUserSaga,
    EDIT_USER, EDIT_USER_ERROR,
    EDIT_USER_REQUEST, EDIT_USER_SUCCESS,
    editUser, editUserSaga,
    FETCH_USERS, FETCH_USERS_MORE, FETCH_USERS_REQUEST,
    FETCH_USERS_SUCCESS, fetchUsersMoreSaga,
    fetchUsersSaga
} from './users';

import {
    fetchLOGSSaga,
    FETCH_LOGS,
    FETCH_LOGS_REQUEST,
    FETCH_LOGS_SUCCESS,
    FETCH_LOGS_ERROR, FETCH_LOGS_MORE, fetchLOGSSagaMore,
} from './logs';

import {
    moduleName,
} from './config';
import {Log, User} from "../../../entities";
import * as ENTITIES from "../../../entities";

export * from './config';
import * as Category from './categories';
import {FETCH_CATEGORYIES_OFFLINE} from "./categories";

export const ReducerRecord: any = Record({
    categories: [],
    logs: [],
    users: [],
    userList: Date.now(),
    categoryList: Date.now(),
    categoryItemEdited: false,
    categoryItemAdded: false,
    userItemAdded: false,
    userItemEdited: false,
    loading: false,
    isChecked: false,
    error: null,
});


export default function reducer(state = new ReducerRecord(), action: any) {
    const {type, payload, error} = action;

    switch (type) {
        case Category.FETCH_CATEGORIES_REQUEST:
        case Category.ADD_CATEGORY_REQUEST:
        case Category.EDIT_CATEGORY_REQUEST:
        case Category.DELETE_CATEGORY_REQUEST:
        case FETCH_LOGS_REQUEST:
        case FETCH_USERS_REQUEST:
        case EDIT_USER_REQUEST:
        case DELETE_USER_REQUEST:
        case ADD_USER_REQUEST:
            return state
                .set('loading', false)
                .set('error', null);

        case Category.FETCH_CATEGORIES_SUCCESS:
        case Category.ADD_CATEGORY_SUCCESS: {
            const loaded = state.categories.map((el: any) => el.id);
            for (let i = 0; i < action.payload.length; i++) {
                if (loaded.indexOf(action.payload[i].id) < 0) {
                    state.categories.push(action.payload[i]);
                    loaded.push(action.payload[i].id);
                }
            }

            return state
                .set('loading', false)
                .set('categoryList', Date.now())
                .set('categoryItemAdded', Date.now())
                .set('categories', [...state.categories.map((el: any) => new ENTITIES.Category(el))])
                .set('error', null);
        }
        case Category.EDIT_CATEGORY_SUCCESS: {
            const list = state.categories.map((user: User) => {
                if (user.id === action.payload.id) {
                    Object.assign(user, action.payload);
                }
                return user;
            });
            return state
                .set('loading', false)
                .set('categoryItemEdited', Date.now())
                .set('categoryList', Date.now())
                .set('categories', [...list])
                .set('error', null);
        }
        case Category.DELETE_CATEGORY_SUCCESS: {
            return state
                .set('loading', false)
                .set('categoryList', Date.now())
                .set('categories', [...state.categories.filter((item: ENTITIES.Category) => item.id !== action.payload.id)])
                .set('error', null);
        }


        case FETCH_USERS_SUCCESS:
        case ADD_USER_SUCCESS: {
            const loaded = state.users.map((el: any) => el.id);
            for (let i = 0; i < action.payload.length; i++) {
                if (loaded.indexOf(action.payload[i].id) < 0) {
                    state.users.push(action.payload[i]);
                    loaded.push(action.payload[i].id);
                }
            }

            return state
                .set('loading', false)
                .set('userList', Date.now())
                .set('userItemAdded', Date.now())
                .set('users', [...state.users.map((el: any) => new User(el))])
                .set('error', null);
        }
        case FETCH_LOGS_SUCCESS: {
            const loaded = state.logs.map((el: any) => el.id);
            for (let i = 0; i < action.payload.length; i++) {
                if (loaded.indexOf(action.payload[i].id) < 0) {
                    state.logs.push(action.payload[i]);
                    loaded.push(action.payload[i].id);
                }
            }

            return state
                .set('loading', false)
                .set('userList', Date.now())
                .set('logs', [...state.logs.map((el: any) => new Log(el))])
                .set('error', null);
        }
        case EDIT_USER_SUCCESS: {
            const users = state.users.map((user: User) => {
                if (user.id === action.payload.id) {
                    Object.assign(user, action.payload);
                }
                return user;
            });
            return state
                .set('loading', false)
                .set('userItemEdited', Date.now())
                .set('userList', Date.now())
                .set('users', [...users])
                .set('error', null);
        }
        case DELETE_USER_SUCCESS: {
            return state
                .set('loading', false)
                .set('userList', Date.now())
                .set('users', [...state.users.filter((user: User) => user.id !== action.payload.id)])
                .set('error', null);
        }
        case SIGN_OUT_SUCCESS: {
            return new ReducerRecord({
                users: [],
                loading: false,
                isChecked: false,
                error: null,
            });
        }
        case Category.EDIT_CATEGORY_ERROR:
        case Category.DELETE_CATEGORY_ERROR:
        case Category.ADD_CATEGORY_ERROR:
        case Category.FETCH_CATEGORIES_ERROR:
        case FETCH_LOGS_ERROR:
        case EDIT_USER_ERROR:
        case DELETE_USER_ERROR:
        case ADD_USER_ERROR:
            return state
                .set('loading', false)
                .set('isChecked', true)
                .set('error', error);

        default:
            return state;
    }
}


export const stateSelector = (state: any) => state[moduleName];
export const usersSelector = createSelector(stateSelector, state => state.users);
export const errorSelector = createSelector(stateSelector, state => state.error);
export const logSelector = createSelector(stateSelector, state => state.logs);
export const categorySelector = createSelector(stateSelector, state => state.categories);


export const saga = function* () {
    yield all([
        takeEvery(ADD_USER, addUserSaga),
        takeEvery(FETCH_USERS, fetchUsersSaga),
        takeEvery(DELETE_USER, deleteUserSaga),
        takeEvery(EDIT_USER, editUserSaga),
        takeEvery(FETCH_LOGS, fetchLOGSSaga),
        takeEvery(FETCH_USERS_MORE, fetchUsersMoreSaga),
        takeEvery(FETCH_LOGS_MORE, fetchLOGSSagaMore),


        takeEvery(Category.FETCH_CATEGORIES, Category.fetchCategoriesSaga),
        takeEvery(Category.FETCH_CATEGORYIES_OFFLINE, Category.fetchCategoriesOfflineSaga),
        takeEvery(Category.EDIT_CATEGORY, Category.editCategoriesaga),
        takeEvery(Category.ADD_CATEGORY, Category.addCategoriesaga),
        takeEvery(Category.DELETE_CATEGORY, Category.deleteCategoriesaga),
    ]);
};
