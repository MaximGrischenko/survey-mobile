import React, {Component} from 'react';
import {Dimensions, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {DBAdapter} from '../../../../sync/database';
import SvgUri from "react-native-svg-uri";
import {Observer, Emitter} from "../../../../utils/interfaces";

interface IMapState {
    database: DBAdapter;
    emitter: Emitter;
}

class SyncAdapter extends Component<{}, IMapState> implements Observer{
    state = {
        database: new DBAdapter(),
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
                <TouchableOpacity style={localStyles.item} onPress={() => this.state.database.resetDB()}>
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