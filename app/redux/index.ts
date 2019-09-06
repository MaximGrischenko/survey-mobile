import {applyMiddleware, createStore, compose} from 'redux';
// import {composeWithDevTools} from 'remote-redux-devtools';
import reducer from './reducer';

import createSagaMiddleware from 'redux-saga';
import rootSaga from './saga';

// import remotedev from 'remotedev-server';
// remotedev({hostname: 'localhost', port: 8080});

declare var window: any;
const sagaMiddleware = createSagaMiddleware();
const enhancer = applyMiddleware(sagaMiddleware);

const store = createStore(reducer, compose(enhancer));
window.store = store;
sagaMiddleware.run(rootSaga);

export default store;