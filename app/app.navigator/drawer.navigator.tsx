import React from 'react';
import {createDrawerNavigator} from 'react-navigation-drawer';
import {createAppContainer} from "react-navigation";
import {Dimensions, ScrollView} from "react-native";
import HomeScreen from '../screens/home/index';
import DrawerScreen from '../screens/drawer/index';

const DrawerNavigator = createDrawerNavigator(
    {
        Home: HomeScreen
    },
    {
        contentComponent: props => <DrawerScreen {...props}/>,
        hideStatusBar: false,
        drawerBackgroundColor: 'rgba(255,255,255, 1)',
        overlayColor: '#c3c3c3',
        initialRouteName: 'Home',
        drawerWidth: Dimensions.get("window").width,
        drawerPosition: 'left',
        contentOptions: {
            activeTintColor: '#fff',
            activeBackgroundColor: '#c3c3c3',
        },
    }
);

export default createAppContainer(DrawerNavigator);