import React from 'react';
import {createMaterialTopTabNavigator, MaterialTopTabBar} from 'react-navigation-tabs';
import {SafeAreaView} from "react-native";
import TablesScreen from '../screens/tables';
import {COLORS} from "../styles/colors";
import GlobalStyles from "../styles/GlobalStyles";
import {createAppContainer} from "react-navigation";

import StationList from '../screens/tables/station.list';


const TabNavigator = createMaterialTopTabNavigator({
        Stations: StationList,
        Parcels: TablesScreen,
    },
    {
        tabBarComponent: props => (
            <SafeAreaView style={GlobalStyles.androidSafeArea}>
                <MaterialTopTabBar {...props} />
            </SafeAreaView>
        ),
        initialRouteName: 'Stations',
        hideStatusBar: false,
        tabBarPosition: 'top',
        swipeEnabled: false,
        animationEnabled: true,
        tabBarOptions: {
            activeTintColor: COLORS.TEXT_COLOR,
            inactiveTintColor: COLORS.TEXT_COLOR,
            style: {
                backgroundColor: '#f2f2f2',
                height: 60
            },
            labelStyle: {
                textAlign: 'center',
            },
            indicatorStyle: {
                borderBottomColor: COLORS.PRIMARY,
                borderBottomWidth: 2,
            },
        },
    }
);

export default createAppContainer(TabNavigator);


