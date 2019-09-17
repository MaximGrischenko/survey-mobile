import React from 'react';
import {createMaterialTopTabNavigator} from 'react-navigation-tabs';

import TablesScreen from '../screens/tables';
import HeaderComponent from "../components/header.component";

const RouteConfig = {
    Stations: {
        screen: TablesScreen,
    },

};

const TabNavigatorConfig = {
    navigationOptions: ({navigation}): { header: any } => ({
        header: null
    }),
    tabBarPosition: 'bottom',
    swipeEnabled: true,
    animationEnabled: true,
    tabBarOptions: {
        activeTintColor: '#FFFFFF',
        inactiveTintColor: '#F8F8F8',
        style: {
            backgroundColor: '#633689',
        },
        labelStyle: {
            textAlign: 'center',
        },
        indicatorStyle: {
            borderBottomColor: '#87B56A',
            borderBottomWidth: 2,
        },
    },
};

const TabNavigator = createMaterialTopTabNavigator(RouteConfig, TabNavigatorConfig);

export default TabNavigator;