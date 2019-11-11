import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {DrawerActions} from 'react-navigation-drawer';
import PromisePiper from '../../../../utils/promise.piper';
import {View, Text, Image, StyleSheet, TouchableOpacity, Dimensions, AsyncStorage} from "react-native";
import * as Progress from 'react-native-progress';
import * as FileSystem from 'expo-file-system';
import SvgUri from 'react-native-svg-uri';
import {Observer, Emitter} from "../../../../utils/interfaces";
import {DBAdapter} from "../../../../sync/database";
import {COLORS} from "../../../../styles/colors";
import {changeControls, locationSelector, powerlinesSelector, tablesStateSelector} from "../../../../redux/modules/map";
import {addPoi, editPoi, fetchLocationPoi, fetchPoiOffline, removePoi} from "../../../../redux/modules/map/poi";
import {editStation, fetchLocationStations, fetchStationsOffline} from "../../../../redux/modules/map/stations";
import {editSegments, fetchLocationSegments, fetchSegmentsOffline} from "../../../../redux/modules/map/segments";
import {editPole, fetchLocationPoles, fetchPolesOffline} from "../../../../redux/modules/map/poles";
import {editParcel, fetchLocationParcels, fetchParcelsOffline} from "../../../../redux/modules/map/parcels";
import {connectionSelector} from "../../../../redux/modules/connect";
import {uploadAssetsAsync} from '../../../../utils/upload.assets';
import {Project, Upload} from "../../../../entities";
import {fetchPowerlinesOffline, fetchProjectPowerlines} from "../../../../redux/modules/map/powerlines";

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

    project: Project,
    selected_powerlines: Array<number>,

    fetchProjectPowerlines: Function,
    fetchLocationStations: Function,
    fetchLocationPoi: Function,
    fetchLocationSegments: Function,
    fetchLocationPoles: Function,
    fetchLocationParcels: Function,

    fetchPowerlinesOffline: Function,
    fetchStationsOffline: Function,
    fetchPoiOffline: Function,
    fetchSegmentsOffline: Function,
    fetchPolesOffline: Function,
    fetchParcelsOffline: Function,
}

interface IMapState {
    database: DBAdapter;
    progress: Emitter;
    status: any;
}

class DrawerMenu extends Component<IMapProps, IMapState> implements Observer {
    static navigationOptions = {
        header: null
    };

    private uploads: Array<Upload> = [];

    state = {
        database: DBAdapter.getInstance(),
        progress: {
            logger: '',
            pending: false
        },
        status: {
            database: '',
            storage: ''
        }
    };

    public update(emitter: Emitter): void {
        this.setState({
            progress: emitter
        })
    }

    async componentDidMount() {
        this.state.database.attach(this);
        setTimeout(async () => await this.synchronization(), 2000);
    }

    async componentWillReceiveProps(nextProps: Readonly<IMapProps>, nextContext: any) {
        if(nextProps.navigation.state.isDrawerOpen !== this.props.navigation.state.isDrawerOpen) {
            if(nextProps.navigation.state.isDrawerOpen) {
                await this.checkStatus();
                this.props.changeControls({
                    name: 'isDrawerOpen',
                    value: true
                });
            } else {
                this.props.changeControls({
                    name: 'isDrawerOpen',
                    value: false
                })
            }
        }

        if(nextProps.isTablesOpen !== this.props.isTablesOpen) {
           await this.checkStatus();
        }

        if(nextProps.connection !== this.props.connection) {
            if(nextProps.connection) {
                setTimeout(async () => await this.synchronization(), 2000);
            }
        }
    }

    componentWillUnmount(): void {
        this.state.database.detach(this);
    }

    private checkStatus = async () => {
        const result = await AsyncStorage.getItem('status');
        if(!result) {
            await this.state.database.initDB();
            setTimeout(async () => await this.synchronization(), 2000);
        } else {
            const status = JSON.parse(result);
            this.setState({status});
            switch (status.database) {
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
        await AsyncStorage.removeItem('status');
    };

    private finalize = async () => {
        await AsyncStorage.removeItem('updates');
        const stored = await AsyncStorage.getItem('status');
        const status = JSON.parse(stored);
        await AsyncStorage.setItem('status', JSON.stringify({
                ...status,
                storage: null
            })
        );
        await AsyncStorage.setItem('timestamp', JSON.stringify(Date.now()));
        await this.checkStatus();
    };

    private downloadDB = async () => {
        this.state.database.loadDB();
        await AsyncStorage.setItem('timestamp', JSON.stringify(Date.now()));
    };

    private updateDB = async () => {
        const timestamp = await AsyncStorage.getItem('timestamp');
        this.state.database.updateDB(timestamp).then(async () => {
            if(this.state.status.storage === 'updated' && this.props.connection) {
                const uploadPiper = new PromisePiper();
                const stored = await AsyncStorage.getItem('updates');
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
                        await this.finalize();
                        console.log('Upload Success', uploadResult);
                    }, async (rejectReason) => {
                        await this.checkStatus();
                        console.log('Upload Error', rejectReason);
                    });
                }
            }
        }).then(() => {
            const {connection, project, selected_powerlines} = this.props;
            console.log('BEFORE FETCH');
            if(connection) {
                if(project) {
                    this.props.fetchLocationStations(project);
                    this.props.fetchLocationPoi(project);
                    this.props.fetchProjectPowerlines(project);
                } else if(selected_powerlines.length) {
                    const reqData = {...project, powerLineId: selected_powerlines[0]};
                    this.props.fetchLocationParcels(reqData);
                    this.props.fetchLocationPoles(reqData);
                    this.props.fetchLocationSegments(reqData);
                }
            } else {
                if(project) {
                    this.props.fetchPowerlinesOffline(project);
                    this.props.fetchStationsOffline(project);
                    this.props.fetchPoiOffline(project);
                } else if(selected_powerlines.length) {
                    const reqData = {...project, powerLineId: selected_powerlines[0]};
                    this.props.fetchParcelsOffline(reqData);
                    this.props.fetchPolesOffline(reqData);
                    this.props.fetchSegmentsOffline(reqData);
                }
            }
        }).catch((error) => {
            console.log('Update Error', error);
        });
    };

    private uploadAssets = (asset) => {
        return new Promise(async (resolve, reject) => {
            try {
                const file = {
                    uri: FileSystem.documentDirectory + `uploads/${asset.path}`,
                    name: 'photo.jpg',
                    filename :'imageName.jpg',
                    type: 'image/jpeg'
                };

                let token = await AsyncStorage.getItem('access_token');

                const response = await uploadAssetsAsync(file, token);
                this.uploads = [...this.uploads, new Upload(response)];

                resolve(response);
            } catch (error) {
                console.log(error);
                reject(error);
            }
        });
    };

    private uploadAssetsPiper = (uploads) => {
        const assetsPiper = new PromisePiper();

        uploads.map((asset) => {
            assetsPiper.pipe((resolve, reject) => {
                this.uploadAssets(asset).then((uploadResult) => {
                    resolve(uploadResult);
                }, (uploadReason) => {
                    reject(uploadReason);
                });
            });
        });

        return assetsPiper;
    };

    private upload = (update) => {
        return new Promise(async (resolve, reject) => {
            try {
                if(update.type === 'poi') {
                    if(update.action === 'add') {
                        const finalize = () => {
                            const poi = {
                                ...update.data,
                                uploads: [...this.uploads]
                            };
                            this.props.addPoi(poi);
                        };

                        if(update.data.uploads.length) {
                            this.uploadAssetsPiper(update.data.uploads).finally(async (uploadResult) => {
                                await finalize();
                                this.uploads = [];
                                console.log('Upload poi assets success', uploadResult);
                            }, async (rejectReason) => {
                                console.log('Upload poi assets error', rejectReason);
                            });
                        } else {
                            await this.props.addPoi(update.data);
                        }
                    } else if(update.action === 'edit') {
                        const finalize = () => {
                            const poi = {
                                ...update.data,
                                uploads: [...this.uploads]
                            };
                            this.props.editPoi(poi);
                        };

                        if(update.data.uploads.length) {
                            this.uploadAssetsPiper(update.data.uploads).finally(async (uploadResult) => {
                                await finalize();
                                this.uploads = [];
                                console.log('Upload poi assets success', uploadResult);
                            }, async (rejectReason) => {
                                console.log('Upload poi assets error', rejectReason);
                            });
                        } else {
                            await this.props.editPoi(update.data);
                        }
                    } else if(update.action === 'remove') {
                        if(update.data.uploads.length) {
                            update.data.uploads.map(async (upload) => {
                                try {
                                    await FileSystem.deleteAsync(FileSystem.documentDirectory  + `uploads/${upload.path}`);
                                } catch(error) {
                                    console.log(error);
                                } finally {
                                    await this.props.removePoi(update.data);
                                }
                            });
                        } else {
                            await this.props.removePoi(update.data);
                        }
                    }
                } else if (update.type === 'station') {
                    const finalize = () => {
                        const station = {
                            ...update.data,
                            uploads: [...this.uploads]
                        };
                        this.props.editStation(station);
                    };

                    if(update.data.uploads.length) {
                        this.uploadAssetsPiper(update.data.uploads).finally(async (uploadResult) => {
                            await finalize();
                            this.uploads = [];
                            console.log('Upload station assets success', uploadResult);
                        }, async (rejectReason) => {
                            console.log('Upload station assets error', rejectReason);
                        });
                    } else {
                        await this.props.editStation(update.data);
                    }
                } else if (update.type === 'segment') {
                    const finalize = () => {
                        const segment = {
                            ...update.data,
                            uploads: [...this.uploads]
                        };
                        this.props.editSegments(segment);
                    };

                    if(update.data.uploads.length) {
                        this.uploadAssetsPiper(update.data.uploads).finally(async (uploadResult) => {
                            await finalize();
                            this.uploads = [];
                            console.log('Upload segment assets success', uploadResult);
                        }, async (rejectReason) => {
                            console.log('Upload segment assets error', rejectReason);
                        });
                    } else {
                        await this.props.editSegments(update.data);
                    }
                } else if (update.type === 'pole') {
                    const finalize = () => {
                        const pole = {
                            ...update.data,
                            uploads: [...this.uploads]
                        };
                        this.props.editPole(pole);
                    };

                    if(update.data.uploads.length) {
                        this.uploadAssetsPiper(update.data.uploads).finally(async (uploadResult) => {
                            await finalize();
                            this.uploads = [];
                            console.log('Upload pole assets success', uploadResult);
                        }, async (rejectReason) => {
                            console.log('Upload pole assets error', rejectReason);
                        });
                    } else {
                        await this.props.editPole(update.data);
                    }
                } else if (update.type === 'parcel') {
                    const finalize = () => {
                        const parcel = {
                            ...update.data,
                            uploads: [...this.uploads]
                        };
                        this.props.editParcel(parcel);
                    };

                    if(update.data.uploads.length) {
                        this.uploadAssetsPiper(update.data.uploads).finally(async (uploadResult) => {
                            await finalize();
                            this.uploads = [];
                            console.log('Upload parcel assets success', uploadResult);
                        }, async (rejectReason) => {
                            console.log('Upload parcel assets error', rejectReason);
                        });
                    } else {
                        await this.props.editParcel(update.data);
                    }
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

        if(status.database === 'exist' && this.props.connection) {
            await this.downloadDB();
        }

        if(status.database === 'updated' && this.props.connection) {
            await this.updateDB();
        }
    };

    render() {
        const {navigation} = this.props;
        const {progress} = this.state;
        return (
            <View>
                <View style={localStyles.container}>
                    <TouchableOpacity style={localStyles.item} onPress={() => this.synchronization()}>
                        {/*<SvgUri*/}
                        {/*    width={Dimensions.get('window').width * 0.2}*/}
                        {/*    height={28}*/}
                        {/*    source={require('../../../../../assets/images/sync.svg')}*/}
                        {/*/>*/}
                        <Image style={{width: 36, height: 30}} source={require('../../../../../assets/images/drawer-sync.png')}/>
                        <Text style={{marginTop: 10}}>Sync</Text>
                    </TouchableOpacity>
                    <View style={localStyles.divider}/>

                    <TouchableOpacity style={localStyles.item} onPress={() => {navigation.dispatch(DrawerActions.toggleDrawer())}}>
                        {/*<SvgUri*/}
                        {/*    width={Dimensions.get('window').width * 0.2}*/}
                        {/*    height={28}*/}
                        {/*    source={require('../../../../../assets/images/map.svg')}*/}
                        {/*/>*/}
                        <Image style={{width: 30, height: 30, resizeMode: 'center'}} source={require('../../../../../assets/images/drawer-map.png')}/>
                        <Text style={{marginTop: 10}}>Map</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={localStyles.item} onPress={() => {
                        navigation.navigate('Tables');
                        this.props.changeControls({
                            name: 'isTablesOpen',
                            value: true
                        })
                    }}>
                        {/*<SvgUri*/}
                        {/*    width={Dimensions.get('window').width * 0.2}*/}
                        {/*    height={28}*/}
                        {/*    source={require('../../../../../assets/images/table.svg')}*/}
                        {/*/>*/}
                        <Image style={{width: 30, height: 30, resizeMode: 'center'}} source={require('../../../../../assets/images/drawer-list.png')}/>
                        <Text style={{marginTop: 10}}>List</Text>
                    </TouchableOpacity>
                </View>
                <View style={{height: 28, flexDirection: 'row', justifyContent: 'space-between'}}>
                    <Text style={localStyles.status}>{progress ? progress.logger : ''}</Text>
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
    connection: connectionSelector(state),
    project: locationSelector(state),
    selected_powerlines: powerlinesSelector(state)
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
        editParcel,
        fetchProjectPowerlines,
        fetchLocationStations,
        fetchLocationPoi,
        fetchLocationSegments,
        fetchLocationPoles,
        fetchLocationParcels,
        fetchPowerlinesOffline,
        fetchStationsOffline,
        fetchPoiOffline,
        fetchSegmentsOffline,
        fetchPolesOffline,
        fetchParcelsOffline,
    }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(DrawerMenu);
