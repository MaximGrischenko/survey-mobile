import {API, appName} from '../../config';
import {Record} from 'immutable';
import {all, cps, call, put, take, takeEvery} from 'redux-saga/effects';
import {createSelector} from 'reselect';

export const ReducerRecord: any = Record({
    alertText: false,
    dialogSaveBtn: false,
    dialogDeleteBtn: false,
    dialogShowBtn: false,
    content: false,

    loading: false,
    isChecked: false,
    error: null,
});

export const moduleName = 'dialogs';

export const SHOW_ALERT = `${appName}/${moduleName}/SHOW_ALERT`;
export const SHOW_ALERT_REQUEST = `${appName}/${moduleName}/SHOW_ALERT_REQUEST`;
export const SHOW_DIALOG = `${appName}/${moduleName}/SHOW_DIALOG`;
export const SHOW_DIALOG_DELETE_BTN = `${appName}/${moduleName}/SHOW_DIALOG_DELETE_BTN`;
export const SHOW_DIALOG_DELETE_BTN_SUCCESS = `${appName}/${moduleName}/SHOW_DIALOG_DELETE_BTN_SUCCESS`;
export const SHOW_DIALOG_SAVE_BTN = `${appName}/${moduleName}/SHOW_DIALOG_SAVE_BTN`;
export const SHOW_DIALOG_SAVE_BTN_SUCCESS = `${appName}/${moduleName}/SHOW_DIALOG_SAVE_BTN_SUCCESS`;
export const SET_DIALOG_SHOW_BTN = `${appName}/${moduleName}/SET_DIALOG_SHOW_BTN`;
export const SET_DIALOG_SHOW_BTN_SUCCESS = `${appName}/${moduleName}/SET_DIALOG_SHOW_BTN_SUCCESS`;
export const SHOW_DIALOG_SUCCESS = `${appName}/${moduleName}/SHOW_DIALOG_SUCCESS`;
export const CLOSE_ALERT = `${appName}/${moduleName}/CLOSE_ALERT`;


export default function reducer(state = new ReducerRecord(), action: any) {
    const {type, payload, error} = action;

    switch (type) {
        case SHOW_ALERT_REQUEST:
            return state
                .set('alertText', payload)
                .set('error', null);
        case SHOW_DIALOG_SUCCESS:
            return state
                .set('content', payload)
                .set('error', null);
        case SHOW_DIALOG_SAVE_BTN_SUCCESS:
            return state
                .set('dialogSaveBtn', payload)
                .set('error', null);
        case SHOW_DIALOG_DELETE_BTN_SUCCESS:
            return state
                .set('dialogDeleteBtn', payload)
                .set('error', null);
        case SET_DIALOG_SHOW_BTN_SUCCESS:
            return state
                .set('dialogShowBtn', payload)
                .set('error', null);
        default:
            return state;
    }
}


export const stateSelector = (state: any) => state[moduleName];
export const alertTextSelector = createSelector(stateSelector, state => state.alertText);
export const contentSelector = createSelector(stateSelector, state => state.content);
export const dialogSaveBtnSelector = createSelector(stateSelector, state => state.dialogSaveBtn);
export const dialogDeleteBtnSelector = createSelector(stateSelector, state => state.dialogDeleteBtn);
export const dialogShowBtnSelector = createSelector(stateSelector, state => state.dialogShowBtn);
export const errorSelector = createSelector(stateSelector, state => state.error);

export function showAlert(alertText: string) {
    return {
        type: SHOW_ALERT,
        payload: alertText
    };
}

export function showDialogContent(alertText: string) {
    return {
        type: SHOW_DIALOG,
        payload: alertText
    };
}
export function setDialogSaveButton(value: any) {
    return {
        type: SHOW_DIALOG_SAVE_BTN,
        payload: value
    };
}
export function setDialogDeleteButton(value: any) {
    return {
        type: SHOW_DIALOG_DELETE_BTN,
        payload: value
    };
}
export function setDialogShowButton(value: any) {
    return {
        type: SET_DIALOG_SHOW_BTN,
        payload: value
    };
}

const showAlertSaga = function* (action: any) {
    try {
        yield put({
            type: SHOW_ALERT_REQUEST,
            payload: action.payload
        });

    } catch (error) {

    }
};
const showDialogContentSaga = function* (action: any) {
    try {

        yield put({
            type: SHOW_DIALOG_SUCCESS,
            payload: action.payload
        });

    } catch (error) {

    }
};
const setDialogSaveButtonSaga = function* (action: any) {
    try {

        yield put({
            type: SHOW_DIALOG_SAVE_BTN_SUCCESS,
            payload: action.payload
        });

    } catch (error) {

    }
};
const setDialogDeleteButtonSaga = function* (action: any) {
    try {

        yield put({
            type: SHOW_DIALOG_DELETE_BTN_SUCCESS,
            payload: action.payload
        });

    } catch (error) {

    }
};

const setDialogShowButtonSaga = function* (action: any) {
    try {
        yield put({
           type: SET_DIALOG_SHOW_BTN_SUCCESS,
           payload: action.payload,
        });
    } catch (e) {

    }
};


export const saga = function* () {
    yield all([
        takeEvery(SHOW_ALERT, showAlertSaga),
        takeEvery(SHOW_DIALOG, showDialogContentSaga),
        takeEvery(SHOW_DIALOG_SAVE_BTN, setDialogSaveButtonSaga),
        takeEvery(SHOW_DIALOG_DELETE_BTN, setDialogDeleteButtonSaga),
        takeEvery(SET_DIALOG_SHOW_BTN, setDialogShowButtonSaga),
    ]);
};
