import React, {Component} from 'react';
import {Provider} from 'react-redux';
import store from './app/redux';

import AppNavigator from './app/app.navigator/index';
import DialogContainer from './app/components/dialog.component';

import {AppLoading} from "expo";
import * as Font from 'expo-font';
import {Asset} from 'expo-asset';
import {AsyncStorage, Image} from "react-native";
import {applyHeader} from "./app/redux/modules/auth";

function cacheImages(images) {
    return images.map(image => {
        if(typeof image === 'string') {
            return Image.prefetch(image);
        } else {
            return Asset.fromModule(image).downloadAsync();
        }
    });
}

function cacheFonts(fonts) {
    return fonts.map(font => Font.loadAsync(font));
}

export default class App extends Component {
    state = {
        isReady: false
    };

    async _loadDataAsync() {
        const imageAssets = cacheImages([
            require('./assets/images/logo.png'),
            require('./assets/images/poi.png'),
            require('./assets/images/pole.png'),
            require('./assets/images/station.png'),
        ]);

        const fontAssets = cacheFonts([]);

        const token = await AsyncStorage.getItem('access_token');
       // await applyHeader(token);

        await Promise.all([...imageAssets, ...fontAssets, applyHeader(token)]);
    }

    render() {
        if(!this.state.isReady) {
            return (
                <AppLoading
                    startAsync={this._loadDataAsync}
                    onFinish={() => this.setState({isReady: true})}
                    onError={console.error}
                />
            )
        }
        return (
            <Provider store={store}>
                <AppNavigator />
                <DialogContainer />
            </Provider>
        );
    }
}
