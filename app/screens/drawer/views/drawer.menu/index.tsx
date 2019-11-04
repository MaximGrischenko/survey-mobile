import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {DrawerActions} from 'react-navigation-drawer';
import PromisePiper from '../../../../utils/promise.piper';
import {View, Text, Image, StyleSheet, TouchableOpacity, Dimensions, AsyncStorage} from "react-native";
import * as Progress from 'react-native-progress';
import SvgUri from 'react-native-svg-uri';
import {Observer, Emitter} from "../../../../utils/interfaces";
import {DBAdapter} from "../../../../sync/database";
import {COLORS} from "../../../../styles/colors";
import {changeControls, tablesStateSelector} from "../../../../redux/modules/map";
import {addPoi, editPoi, removePoi} from "../../../../redux/modules/map/poi";
import {editStation} from "../../../../redux/modules/map/stations";
import {editSegments} from "../../../../redux/modules/map/segments";
import {editPole} from "../../../../redux/modules/map/poles";
import {editParcel} from "../../../../redux/modules/map/parcels";
import {connectionSelector} from "../../../../redux/modules/connect";
import {API} from "../../../../config";
import axios from 'react-native-axios';

interface IMapProps {
    navigation: any,
    connection: boolean,
    isTablesOpen: boolean,
    changeControls: Function,
    addPoi: Function,
    removePoi: Function,
    editPoi: Function,
    editStation: Function,
    editSegments: Function,
    editPole: Function,
    editParcel: Function,
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
    private LIMIT_TO_LOAD = 200000;
    private projects = [];
    private powerlines = [];
    private tables = [
        {
            name: 'categories',
        },
        {
            name: 'projects',
        },
        {
            name: 'powerlines',
        },
        {
            name: 'stations',
        },
        {
            name: 'pois',
        },
        {
            name: 'parcels',
        },
        {
            name: 'poles',
        },
        {
            name: 'segments',
        }
    ];

    state = {
        database: DBAdapter.getInstance(),
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
        // setTimeout(async () => await this.synchronization(), 1000);
    }

    async componentWillReceiveProps(nextProps: Readonly<IMapProps>, nextContext: any) {
        // if(nextProps.navigation.state.isDrawerOpen !== this.props.navigation.state.isDrawerOpen) {
        //     if(nextProps.navigation.state.isDrawerOpen) {
        //         await this.checkStatus();
        //         this.props.changeControls({
        //             name: 'isDrawerOpen',
        //             value: true
        //         });
        //     } else {
        //         this.props.changeControls({
        //             name: 'isDrawerOpen',
        //             value: false
        //         })
        //     }
        // }
        //
        // if(nextProps.isTablesOpen !== this.props.isTablesOpen) {
        //    await this.checkStatus();
        // }
        //
        // if(nextProps.connection !== this.props.connection) {
        //     if(nextProps.connection) {
        //         // await this.synchronization();
        //         setTimeout(async () => await this.synchronization(), 1000);
        //     }
        // }
    }


    componentWillUnmount(): void {
        this.state.database.detach(this);
    }

    private checkStatus = async () => {
        const status = await AsyncStorage.getItem('db_status');
        if(!status) {
            await this.state.database.initDB();
            if(this.props.connection) {
                setTimeout(async () => await this.synchronization(), 1000);
            }
        } else {
            this.setState({status});
            switch (status) {
                case 'exist': {
                    this.setState({
                        progress: {
                            ...this.state.progress,
                            logger: 'Local DB initialized'
                        }
                    })
                } break;
                case 'updated': {
                    this.setState({
                        progress: {
                            ...this.state.progress,
                            logger: 'Local DB updated'
                        }
                    });
                } break;
                case 'synced': {
                    this.setState({
                        progress: {
                            ...this.state.progress,
                            logger: 'Local DB is up-to-date'
                        }
                    })
                } break;
                case 'error': {
                    this.setState({
                        progress: {
                            ...this.state.progress,
                            logger: 'Local DB has error'
                        }
                    })
                } break;
            }
        }
    };

    private resetDB = async () => {
        await this.state.database.resetDB();
        await this.state.database.initDB();
        await this.clearUpdates();
    };

    private clearUpdates = async () => {
        await AsyncStorage.removeItem('updates');
    };

    private downloadDB = async () => {
        this.state.database.loadDB();
        await AsyncStorage.setItem('timestamp', JSON.stringify(Date.now()));
    };

    private updateDB = async () => {
        const timestamp = await AsyncStorage.getItem('timestamp');
        this.state.database.updateDB(timestamp);
    };

    private upload = (update) => {
        return new Promise(async (resolve, reject) => {
            try {
                if(update.type === 'poi') {
                    if(update.action === 'add') {
                        await this.props.addPoi(update.data);
                    } else if(update.action === 'edit') {
                        await this.props.editPoi(update.data);
                    } else if(update.action === 'remove') {
                        await this.props.removePoi(update.data);
                    }
                } else if (update.type === 'station') {
                    await this.props.editStation(update.data);
                } else if (update.type === 'segment') {
                    await this.props.editSegments(update.data);
                } else if (update.type === 'pole') {
                    await this.props.editPole(update.data);
                } else if (update.type === 'parcel') {
                    await this.props.editParcel(update.data);
                }
                setTimeout(() => resolve({finished: true}), 500);
            } catch (error) {
                reject(error);
            }
        })
    };

    private synchronization = async () => {
        await this.checkStatus();
        const {status} = this.state;

        //TODO before merge check remote updates...

        if(status === 'exist' && this.props.connection) {
           await this.downloadDB();
        }

        if(status === 'updated' && this.props.connection) {
            const uploadPiper = new PromisePiper();
            const stored =  await AsyncStorage.getItem('updates');
            if(stored) {
                const updates = JSON.parse(stored);
                const transactions = updates
                    .sort((a, b) => a.data.updatedAt - b.data.updatedAt)
                    .reduce((acc, update) => {
                        if(update.action === 'add') {
                            return [...acc, update]
                        } else if(update.action === 'edit') {
                            const result = acc.find((i) => i.data.id === update.data.id && i.action === 'add');
                            if(result) {
                                return acc.map(i => i.data.id === update.data.id && i.data.updatedAt < update.data.updatedAt ? {
                                    ...i,
                                    data: update.data
                                } : i)
                            } else {
                                return [...acc, update]
                            }
                        }
                        return [...acc, update]
                    }, []);

                transactions.map((update) => {
                    uploadPiper.pipe((resolve, reject) => {
                        this.upload(update).then((uploadResult) => {
                            resolve(uploadResult);
                        }, (uploadReason) => {
                            reject(uploadReason);
                        });
                    });
                });

                await uploadPiper.finally(async (uploadResult) => {
                    await this.clearUpdates();
                    await AsyncStorage.setItem('db_status', 'synced');
                    await AsyncStorage.setItem('timestamp', JSON.stringify(Date.now()));
                    await this.checkStatus();
                    console.log('Upload Success', uploadResult);
                }, async (rejectReason) => {
                    await AsyncStorage.setItem('db_status', 'error');
                    await this.checkStatus();
                    console.log('Upload Error', rejectReason);
                });
            }
        }
    };

    render() {
        const {navigation} = this.props;
        const {progress, status} = this.state;
        return (
            <View>
                <View style={localStyles.container}>
                    <TouchableOpacity style={localStyles.item} onPress={() => this.synchronization()}>
                        <SvgUri
                            width={Dimensions.get('window').width * 0.2}
                            height={28}
                            source={require('../../../../../assets/images/sync.svg')}
                        />
                        {/*<Image style={{width: 35, height: 30}} source={require('../../../../../assets/images/sync.png')}/>*/}
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

                    <TouchableOpacity style={localStyles.item} onPress={() => {
                        navigation.navigate('Tables');
                        this.props.changeControls({
                            name: 'isTablesOpen',
                            value: true
                        })
                    }}>
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
                    <TouchableOpacity style={localStyles.item} onPress={() => this.updateDB()}>
                        <Text style={localStyles.reset}>UPDATE</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={localStyles.item} onPress={() => this.resetDB()}>
                        <Text style={localStyles.reset}>Reset</Text>
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
    reset: {
        lineHeight: 28,
        color: COLORS.PRIMARY,
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

const mapStateToProps = (state: any) => ({
    isTablesOpen: tablesStateSelector(state),
    connection: connectionSelector(state)
});

const mapDispatchToProps = (dispatch: any) => (
    bindActionCreators({
        changeControls,
        addPoi,
        removePoi,
        editPoi,
        editStation,
        editSegments,
        editPole,
        editParcel
    }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(DrawerMenu);
