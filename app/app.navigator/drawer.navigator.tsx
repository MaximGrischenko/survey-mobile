import React from 'react';
import {createDrawerNavigator} from 'react-navigation-drawer';
import {createAppContainer} from "react-navigation";
import {Dimensions} from "react-native";
import MapController from '../screens/map';

import DrawerScreen from '../screens/drawer';

const DrawerNavigator = createDrawerNavigator(
    {
        MapScreen: {
            screen: MapController,
        }
    },
    {
        contentComponent: props => <DrawerScreen {...props}/>,
        hideStatusBar: false,
        drawerBackgroundColor: 'rgba(255,255,255, 1)',
        overlayColor: '#c3c3c3',
        initialRouteName: 'MapScreen',
        drawerWidth: Dimensions.get("window").width,
        drawerPosition: 'left',
        contentOptions: {
            activeTintColor: '#fff',
            activeBackgroundColor: '#c3c3c3',
        },
    }
);

export default createAppContainer(DrawerNavigator);