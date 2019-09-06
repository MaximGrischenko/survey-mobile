import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {Text, View, StyleSheet} from "react-native";
import {COLORS} from "../../styles/colors";

interface IMapProps {
    navigation: any
}

class DrawerScreen extends Component<IMapProps> {
    render() {
        return (
            <View style={localStyles.container}>
                <Text style={{paddingTop: 105}}></Text>
                <Text>Place for Menu</Text>
                <Text>Place for Projects</Text>
                <Text>Place for ScrollView</Text>
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