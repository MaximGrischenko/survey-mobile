import {applyMiddleware, createStore, compose} from 'redux';
import reducer from './reducer';

import createSagaMiddleware from 'redux-saga';
import rootSaga from './saga';

declare var window: any;
const sagaMiddleware = createSagaMiddleware();
const enhancer = applyMiddleware(sagaMiddleware);

const store = createStore(reducer, compose(enhancer));
window.store = store;
sagaMiddleware.run(rootSaga);

export default store;