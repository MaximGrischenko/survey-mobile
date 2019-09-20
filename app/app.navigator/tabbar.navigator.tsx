import React from 'react';
import {createMaterialTopTabNavigator, MaterialTopTabBar} from 'react-navigation-tabs';
import {SafeAreaView} from "react-native";
import TablesScreen from '../screens/lists';
import {COLORS} from "../styles/colors";
import GlobalStyles from "../styles/GlobalStyles";
import {createAppContainer} from "react-navigation";

import StationList from '../screens/lists/station.list';
import SegmentList from '../screens/lists/segment.list';
import ParcelList from '../screens/lists/parcel.list';
import PoleList from '../screens/lists/pole.list';
import PoiList from '../screens/lists/poi.list';

const TabNavigator = createMaterialTopTabNavigator({
        Poles: PoleList,
        Stations: StationList,
        Pois: PoiList,
        Parcels: ParcelList,
        Segments: SegmentList,
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
                fontSize: 10,
                textTransform: 'none'
            },
            indicatorStyle: {
                borderBottomColor: COLORS.PRIMARY,
                borderBottomWidth: 2,
            },
        },
    }
);

export default createAppContainer(TabNavigator);


