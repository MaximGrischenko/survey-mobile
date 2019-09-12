import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import DrawerMenu from "./views/drawer.menu";

import {Text, View, StyleSheet, ScrollView} from "react-native";
import {COLORS} from "../../styles/colors";
import DrawerProjects from "./views/drawer.projects";
import DrawerPowerlines from './views/drawer.powerlines';
import DrawerEntities from "./views/drawer.entities";
import DrawerFilter from "./views/drawer.filter";

interface IMapProps {
    navigation: any
}

class DrawerScreen extends Component<IMapProps> {
    render() {
        return (
            <View style={localStyles.container}>
                <Text style={{paddingTop: 105}}></Text>
                <DrawerMenu navigation={this.props.navigation}/>
                <ScrollView>
                    <DrawerProjects />
                    <DrawerPowerlines />
                    <DrawerEntities />
                    <DrawerFilter />
                </ScrollView>
            </View>
        )
    }
}

const localStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.BACKGROUND,
        paddingLeft: 10,
        paddingRight: 10,
    }
});

export default DrawerScreen;