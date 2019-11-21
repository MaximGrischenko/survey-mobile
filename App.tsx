import React, {Component} from 'react';
import {Provider} from 'react-redux';
import store from './app/redux';

import NavigationService from './app/app.navigator/navigation.service';
import AppNavigator from './app/app.navigator/index';
import DialogContainer from './app/components/dialog.component';
import AlertContainer from './app/components/dialog.component/dialogs/alert.dialog';

import {AppLoading} from "expo";
import * as Font from 'expo-font';
import * as Location from "expo-location";
import * as Permissions from 'expo-permissions';
import {Asset} from 'expo-asset';
import {AsyncStorage, Image} from "react-native";
import {applyHeader} from "./app/redux/modules/auth";
import {applyGEOPosition} from "./app/redux/modules/map";

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
        isReady: false,
    };

    async _loadDataAsync() {
        const imageAssets = cacheImages([
            require('./assets/images/logo.png'),
            require('./assets/images/drawer-poi.png'),
            require('./assets/images/poi.png'),
            require('./assets/images/poi-x4.png'),
            require('./assets/images/drawer-pole.png'),
            require('./assets/images/pole.png'),
            require('./assets/images/pole-x4.png'),
            require('./assets/images/drawer-station.png'),
            require('./assets/images/station.png'),
            require('./assets/images/station-x4.png'),
            require('./assets/images/location.png'),
            require('./assets/images/location-x4.png'),
            require('./assets/images/map.svg'),
            require('./assets/images/parcel.svg'),
            require('./assets/images/poi.svg'),
            require('./assets/images/pole.svg'),
            require('./assets/images/segment.svg'),
            require('./assets/images/station.svg'),
            require('./assets/images/sync.svg'),
        ]);

        const fontAssets = cacheFonts([]);

        const token = await AsyncStorage.getItem('access_token');
        // let location: any = '';
        //
        // let hasLocationPermissions = false;
        // let locationResult =  null;
        //
        // let {status} = await Permissions.askAsync(Permissions.LOCATION);
        //
        // if(status !== 'granted') {
        //     locationResult = 'Permission to access location was denied';
        // } else {
        //     hasLocationPermissions =  true;
        //     location = await Location.getCurrentPositionAsync({
        //         enableHighAccuracy: true, timeout: 20000,
        //     });
        // }

        // this.setState({
        //    locationResult: JSON.stringify(location)
        // });

       // await applyHeader(token);

        //TODO [...imageAssets, ...fontAssets], applyHeader(token), applyGeoposition(location)

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
                <AppNavigator ref={ref => NavigationService.setNavigator(ref)}/>
                <DialogContainer />
                <AlertContainer />
            </Provider>
        );
    }
}
