import React, {Component} from 'react';
import {Dimensions, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {Database} from '../../../../utils/database';
import SvgUri from "react-native-svg-uri";
import {Observer, Emitter} from "../../../../utils/database/interfaces";

interface IMapState {
    database: Database;
    emitter: Emitter;
}

class SyncAdapter extends Component<{}, IMapState> implements Observer{
    state = {
        database: new Database(),
        emitter: null,
    };

    public update(emitter: Emitter): void {
        this.setState({
            emitter: emitter
        })
    }

    componentDidMount(): void {
        this.state.database.attach(this);
    }

    componentWillUnmount(): void {
        this.state.database.detach(this);
    }

    render() {
        console.log('PROGRESS', this.state.emitter);
        return (
            <View>
                <TouchableOpacity style={localStyles.item} onPress={() => this.state.database.initDB()}>
                    <SvgUri
                        width={Dimensions.get('window').width * 0.2}
                        height={28}
                        source={require('../../../../../assets/images/sync.svg')}
                    />
                    <Text style={{marginTop: 10}}>Sync</Text>
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

export default SyncAdapter;