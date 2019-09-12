import React, {Component} from 'react';
import {View, Text, StyleSheet} from "react-native";

const ClusterMarker = ({count}) => (
    <View style={localStyles.container}>
        <View style={localStyles.bubble}>
            <Text style={localStyles.count}>{count}</Text>
        </View>
    </View>
);

const localStyles = StyleSheet.create({
    container: {
        flexDirection: "column",
        alignSelf: "flex-start"
    },
    bubble: {
        flex: 0,
        flexDirection: "row",
        alignSelf: "flex-start",
        backgroundColor: "#ffbbbb",
        padding: 4,
        borderRadius: 4,
        borderColor: "#ffbbbb",
        borderWidth: 1
    },
    count: {
        color: "#fff",
        fontSize: 13
    }
});

export default ClusterMarker;