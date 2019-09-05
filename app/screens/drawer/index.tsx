import React, {Component} from 'react';
import {Text, View} from "react-native";

interface IMapProps {
    navigation: any
}

class DrawerScreen extends Component<IMapProps> {
    render() {
        return (
            <View style={{flex: 1}}>
                <Text style={{paddingTop: 105}}></Text>
                <Text>Place for Menu</Text>
                <Text>Place for Projects</Text>
                <Text>Place for ScrollView</Text>
            </View>
        )
    }
}

export default DrawerScreen;