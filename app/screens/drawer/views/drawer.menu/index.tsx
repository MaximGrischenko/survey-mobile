import React, {Component} from 'react';
import { DrawerActions } from 'react-navigation-drawer';
import {View, Text, StyleSheet, TouchableOpacity, Dimensions} from "react-native";
import SvgUri from 'react-native-svg-uri';
import {Observer, Emitter} from "../../../../utils/database/interfaces";
import {Database} from "../../../../utils/database";

interface IMapProps {
    navigation: any
}

interface IMapState {
    database: Database;
    progress: Emitter;
}

class DrawerMenu extends Component<IMapProps, IMapState> implements Observer {
    static navigationOptions = {
        header: null
    };

    state = {
        database: new Database(),
        progress: null,
    };

    public update(emitter: Emitter): void {
        this.setState({
            progress: emitter
        })
    }

    componentDidMount(): void {
        this.state.database.attach(this);
    }

    componentWillUnmount(): void {
        this.state.database.detach(this);
    }

    render() {
        const {navigation} = this.props;
        const {progress} = this.state;
        console.log('PROGRESS', progress);
        return (
            <View style={localStyles.container}>
                <TouchableOpacity style={localStyles.item} onPress={() => this.state.database.syncBD()}>
                    <SvgUri
                        width={Dimensions.get('window').width * 0.2}
                        height={28}
                        source={require('../../../../../assets/images/sync.svg')}
                    />
                    <Text style={{marginTop: 10}}>Sync</Text>
                </TouchableOpacity>

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
