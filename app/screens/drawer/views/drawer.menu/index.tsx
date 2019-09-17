import React, {Component} from 'react';
import { DrawerActions } from 'react-navigation-drawer';
import {View, Text, StyleSheet, TouchableOpacity, Dimensions} from "react-native";
import SvgUri from 'react-native-svg-uri';
import {CirclesLoader} from 'react-native-indicator';

interface IMapProps {
    navigation: any
}

interface IMapState {
    isSync: any,
}

class DrawerMenu extends Component<IMapProps, IMapState> {
    static navigationOptions = {
        header: null
    };

    state = {
        isSync: false
    };

    render() {
        const {navigation} = this.props;
        return (
            <View style={localStyles.container}>
                {
                    this.state.isSync ? (
                        <CirclesLoader/>
                    ) : (
                        <TouchableOpacity style={localStyles.item}>
                            <SvgUri
                                width={Dimensions.get('window').width * 0.2}
                                height={28}
                                source={require('../../../../../assets/images/sync.svg')}
                            />
                            <Text style={{marginTop: 10}}>Sync</Text>
                        </TouchableOpacity>
                    )
                }

                <View style={localStyles.divider}/>

                <TouchableOpacity style={localStyles.item} onPress={() => {navigation.dispatch(DrawerActions.toggleDrawer())}}>
                    <SvgUri
                        width={Dimensions.get('window').width * 0.2}
                        height={28}
                        source={require('../../../../../assets/images/map.svg')}
                    />
                    <Text style={{marginTop: 10}}>Map</Text>
                </TouchableOpacity>

                <TouchableOpacity style={localStyles.item} onPress={() => navigation.navigate('Tables')}>
                    <SvgUri
                        width={Dimensions.get('window').width * 0.2}
                        height={28}
                        source={require('../../../../../assets/images/table.svg')}
                    />
                    <Text style={{marginTop: 10}}>Table</Text>
                </TouchableOpacity>
            </View>
        )
    }
}

const localStyles = StyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingBottom: 30,
        borderBottomWidth: 1,
        borderBottomColor: '#979797',
        borderBottomEndRadius: 1,
    },
    item: {
        display: 'flex',
        alignItems: 'center',
    },
    divider: {
        width: 1,
        backgroundColor: '#979797',
    },
});

export default DrawerMenu;
