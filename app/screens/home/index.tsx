import React, {Component} from 'react';
import {Text, View} from "react-native";

interface IMapProps {
    navigation: any
}

class HomeScreen extends Component<IMapProps> {
    render() {
        return (
            <View>
                <Text>Home Screen</Text>
            </View>
        )
    }
}

export default HomeScreen;