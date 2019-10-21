import React, {Component} from 'react';
import { DrawerActions } from 'react-navigation-drawer';
import {View, Text, StyleSheet, TouchableOpacity, Dimensions, AsyncStorage} from "react-native";
import * as Progress from 'react-native-progress';
import SvgUri from 'react-native-svg-uri';
import {Observer, Emitter} from "../../../../utils/database/interfaces";
import {DBAdapter} from "../../../../utils/database";
import {COLORS} from "../../../../styles/colors";

interface IMapProps {
    navigation: any
}

interface IMapState {
    database: DBAdapter;
    progress: Emitter;
    status: string;
}

class DrawerMenu extends Component<IMapProps, IMapState> implements Observer {
    static navigationOptions = {
        header: null
    };

    state = {
        database: new DBAdapter(),
        progress: {
            logger: '',
            pending: false
        },
        status: '',
    };

    public update(emitter: Emitter): void {
        this.setState({
            progress: emitter
        })
    }

    async componentDidMount() {
        this.state.database.attach(this);
        const status = await AsyncStorage.getItem('db_status');

        this.setState({
           status
        });

        if(!status) {
            await this.state.database.initDB();
        }
    }

    componentWillUnmount(): void {
        this.state.database.detach(this);
    }

    private resetDB = async () => {
        await this.state.database.dropDB();
        await this.state.database.initDB();
    };

    private syncDB = async () => {
        const {status} = this.state;

        switch (status) {
            case '': {

            } break;

            default: {

            }
        }
    };

    render() {
        const {navigation} = this.props;
        const {progress, status} = this.state;
        console.log('PROGRESS', progress);
        console.log('STATUS', status);
        return (
            <View>
                <View style={localStyles.container}>
                    <TouchableOpacity style={localStyles.item} onPress={() => this.state.database.syncDB()}>
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
                <View style={{height: 28, flexDirection: 'row', justifyContent: 'space-between'}}>
                    <Text style={localStyles.status}>{progress.logger}</Text>
                    <TouchableOpacity style={localStyles.item} onPress={() => this.resetDB()}>
                        <Text style={localStyles.status}>Reset</Text>
                    </TouchableOpacity>
                </View>
                {
                    progress.pending ? (
                        <Progress.Bar indeterminate={true} color={COLORS.PRIMARY} height={1} width={null}/>
                    ) : (
                        <View style={localStyles.underline}/>
                    )
                }
            </View>
        )
    }
}
const localStyles = StyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
        // paddingBottom: 30,
    },
    item: {
        display: 'flex',
        alignItems: 'center',
    },
    divider: {
        width: 1,
        backgroundColor: '#979797',
    },
    status: {
        lineHeight: 28,
        color: COLORS.TEXT_COLOR,
        fontSize: 14,
        fontWeight: 'bold'
    },
    underline: {
        width: '100%',
        height: 1,
        backgroundColor: '#979797',
        marginVertical: 1
    }
});

export default DrawerMenu;
