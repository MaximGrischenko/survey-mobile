import React, {Component} from 'react';
import {Provider} from 'react-redux';
import store from './app/redux';

import AppNavigator from './app/app.navigator/index';
import DialogContainer from './app/components/dialog.component';

export default class App extends Component {
    render() {
        return (
            <Provider store={store}>
                <AppNavigator />
                <DialogContainer />
            </Provider>
        );
    }
}
