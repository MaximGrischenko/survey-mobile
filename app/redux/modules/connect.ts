import {NetInfo} from "react-native";
import {eventChannel} from 'redux-saga';
import {Record} from 'immutable';
import {call, put, take} from 'redux-saga/effects';
import {appName} from "../../config";
import {createSelector} from 'reselect';

export const ReducerRecord: any = Record({
    connection: null,
});

export const moduleName = 'connect';

export const GET_CONNECTION_STATUS = `${appName}/${moduleName}/GET_CONNECTION_STATUS`;

export default function reducer(state = new ReducerRecord(), action: any) {
    const {type, payload} = action;

    switch (type) {
        case GET_CONNECTION_STATUS:
            return state
                .set('connection', payload);
        default:
            return state;
    }
}

function* startChannel(syncActionName) {
    const channel = eventChannel(listener => {
        const handleConnectivityChange = (isConnected) => {
            listener(isConnected);
        };

        NetInfo.isConnected.addEventListener("connectionChange", handleConnectivityChange);
        return () => NetInfo.isConnected.removeEventListener("connectionChange", handleConnectivityChange);
    });

    while (true) {
        const connectionInfo = yield take(channel);
        yield put({type: syncActionName, payload: connectionInfo });
    }
}

export const stateSelector = (state: any) => state[moduleName];
export const connectionSelector = createSelector(stateSelector, state => state.connection);

export const saga = function* () {
    try {
        yield call(startChannel, GET_CONNECTION_STATUS);
    } catch (e) {
        console.log(e);
    }
};