import React from 'react';
import {connect} from 'react-redux';
import MapScreen from '../map';
import {Alert, AsyncStorage, Platform, Text, View} from "react-native";
import {
    applyGeoposition, changeControls,
    drawerStateSelector,
    locationParcelsSelector, locationPoisSelector,
    locationPolesSelector,
    locationSegmentsSelector, locationSelector,
    locationStationsSelector,
    moduleName, powerlineSelector
} from "../../redux/modules/map";
import {Geometry, GPSCoordinate, Parcel, Poi, Pole, Project, Segment, Station} from "../../entities";
import _ from "lodash";
import {searchSelector} from "../../redux/modules/auth";
import {Callout, Marker, Polygon, Polyline} from "react-native-maps";
import {bindActionCreators} from "redux";
import {showAlert, showDialogContent} from "../../redux/modules/dialogs";
import EditStationDialog from "../../components/dialog.component/dialogs/edit.station";
import EditParcelDialog from "../../components/dialog.component/dialogs/edit.parcel";
import EditPoleDialog from "../../components/dialog.component/dialogs/edit.pole";
import EditSegmentDialog from "../../components/dialog.component/dialogs/edit.segment";
import EditPoiDialog from "../../components/dialog.component/dialogs/edit.poi";
import {parcel_statuses, segment_statuses} from "../../redux/utils";
import * as Permissions from "expo-permissions";
import * as Location from "expo-location";
import {fetchCategories, fetchCategoriesOffline} from "../../redux/modules/admin/categories";
import {connectionSelector} from "../../redux/modules/connect";

// export const HomeScreen = (navigation) => {
//     console.log('NAV', navigation);
//     return (
//         <MapScreen navigation={navigation}/>
//     )
// };

interface IMapProps {
    connection: boolean;
    isDrawerOpen: boolean;
    mapCenter: GPSCoordinate;
    selected_powerlines: Array<number>,
    dateFilter: any,
    search: string;
    project: Project,
    allowAddPoi: boolean,

    stations: Array<Station>;
    showStations: boolean;
    stationList: any;

    poles: Array<Pole>,
    showPoles: boolean,
    polesList: any,

    parcels: Array<Parcel>,
    showParcels: boolean,
    parcelList: any,

    segments: Array<Segment>,
    showSegments: boolean,
    segmentList: any,

    pois: Array<Poi>,
    showPois: boolean,
    poiList: any,

    showDialogContent: Function;
    showAlert: Function;
    changeControls: Function;
    fetchCategories: Function;
    fetchCategoriesOffline: Function;
}

interface IMapState {
    region: any,
    location: any,
    options: any,
    showUserLocation: boolean,
    relocate: boolean,
    expandCluster: boolean,
    // forceUpdate: boolean,
    expanded: boolean,

    merged: boolean,

    initialized: boolean,

    shouldUpdate: boolean,

    status: string,
}

class HomeScreen extends React.Component<IMapProps, IMapState> {
    private cluster: Array<any> = [];
    private stationList: any;
    private segmentList: any;
    private poiList: any;
    private polesList: any;
    private parcelList: any;
    private MARKER_TYPE: any = {
        STATION: 1,
        PARCEL: 2,
        SEGMENT: 3,
        POLE: 4,
        POI: 5
    };

    state = {
        region: null,
        location: null,
        showUserLocation: false,
        relocate: false,
        expandCluster: false,
        // forceUpdate: false,
        expanded: false,
        merged: true,
        shouldUpdate: true,

        initialized: false,

        status: '',

        options: {
            radius: 40,
            nodeSize: 25,
            maxZoom: 10,
            minZoom: 1
        },
    };

    async componentWillMount() {
        // if(this.props.connection) {
        //     await this.props.fetchCategories();
        // } else {
        //     await this.props.fetchCategoriesOffline();
        // }

        const region = {...this.props.mapCenter, latitudeDelta: 0.1, longitudeDelta: 0.1};

        let location = await AsyncStorage.getItem('location');

        if(location) {
            const GEOPosition = JSON.parse(location);
            region.latitude = GEOPosition.coords.latitude;
            region.longitude = GEOPosition.coords.longitude;

            this.setState({
                location: {...GEOPosition.coords},
                showUserLocation: true
            });
            await applyGeoposition(location);
        }

        this.setState({region});

    }

    async componentDidMount() {
        if(this.props.connection) {
           await this.props.fetchCategories();
        } else {
           await this.props.fetchCategoriesOffline();
        }

        // const region = {...this.props.mapCenter, latitudeDelta: 0.1, longitudeDelta: 0.1};
        //
        // let location = await AsyncStorage.getItem('location');
        //
        // if(location) {
        //     const GEOPosition = JSON.parse(location);
        //     region.latitude = GEOPosition.coords.latitude;
        //     region.longitude = GEOPosition.coords.longitude;
        //
        //     this.setState({
        //         location: {...GEOPosition.coords},
        //         showUserLocation: true
        //     });
        //     await applyGeoposition(location);
        // }
        //
        // await this.setState({
        //     region,
        // });
    }

    shouldComponentUpdate(nextProps: Readonly<IMapProps>, nextState: Readonly<IMapState>, nextContext: any): boolean {
        return nextState.shouldUpdate;
        // return true;
    }

    componentWillReceiveProps(nextProps: Readonly<IMapProps>, nextContext: any): void {
        if(nextProps.isDrawerOpen !== this.props.isDrawerOpen && nextProps.isDrawerOpen) {
            this.cluster = [];
            this.setState({
                shouldUpdate: false,
            });
        }

        this.setState({
            shouldUpdate: true,
        });

        // else if(nextProps.isDrawerOpen !== this.props.isDrawerOpen && !nextProps.isDrawerOpen) {
        //     this.renderStations(nextProps.stations, nextProps.showStations, nextProps.search);
        //     this.renderPoles(nextProps.poles, nextProps.showPoles, nextProps.search);
        //     this.renderPois(nextProps.pois, nextProps.showPois, nextProps.search);
        //     this.renderSegments(nextProps.segments, nextProps.showSegments, nextProps.search);
        //     this.renderParcels(nextProps.parcels, nextProps.showParcels, nextProps.search);
        // }
        // if(nextProps.connection !== this.props.connection && nextProps.connection) {
        //     this.props.fetchCategories();
        // } else if(nextProps.connection !== this.props.connection && !nextProps.connection) {
        //     this.props.fetchCategoriesOffline();
        // }
        if(nextProps.stationList !== this.stationList || nextProps.showStations !== this.props.showStations) {
            this.renderStations(nextProps.stations, nextProps.showStations, nextProps.search);
            this.stationList = nextProps.stationList;
        }
        if(nextProps.polesList !== this.polesList || nextProps.showPoles !== this.props.showPoles) {
            this.renderPoles(nextProps.poles, nextProps.showPoles, nextProps.search);
            this.polesList = nextProps.polesList;
        }
        if(nextProps.poiList !== this.poiList || nextProps.showPois !== this.props.showPois) {
            this.renderPois(nextProps.pois, nextProps.showPois, nextProps.search);
            this.poiList = nextProps.poiList;
        }
        if(nextProps.segmentList !== this.segmentList || nextProps.showSegments !== this.props.showSegments) {
            this.renderSegments(nextProps.segments, nextProps.showSegments, nextProps.search);
            this.segmentList = nextProps.segmentList;
        }
        if(nextProps.parcelList !== this.parcelList || nextProps.showParcels !== this.props.showParcels) {
            this.renderParcels(nextProps.parcels, nextProps.showParcels, nextProps.search);
            this.parcelList = nextProps.parcelList;
        }

        if (
            nextProps.dateFilter !== this.props.dateFilter ||
            nextProps.search !== this.props.search ||
            nextProps.selected_powerlines.length !== this.props.selected_powerlines.length ||
            (nextProps.allowAddPoi !== this.props.allowAddPoi) ||
            (nextProps.isDrawerOpen !== this.props.isDrawerOpen && !nextProps.isDrawerOpen)
        ) {
            this.renderStations(nextProps.stations, nextProps.showStations, nextProps.search);
            this.renderPoles(nextProps.poles, nextProps.showPoles, nextProps.search);
            this.renderPois(nextProps.pois, nextProps.showPois, nextProps.search);
            this.renderSegments(nextProps.segments, nextProps.showSegments, nextProps.search);
            this.renderParcels(nextProps.parcels, nextProps.showParcels, nextProps.search);
            // this.setState({
            //     forceUpdate: true
            // });
        }

        if(!_.isEqual(nextProps.stations, this.props.stations) && nextProps.stations.length) {
            const location = nextProps.stations[Math.round(nextProps.stations.length / 2)].points.toGPS();
            const region = {...location, latitudeDelta: 1, longitudeDelta: 1};
            //this.moveToLocation(region, 2000);
            this.setState({
                region
            })
        }
    }

    componentDidUpdate(prevProps: Readonly<IMapProps>, prevState: Readonly<IMapState>, snapshot?: any): void {
        // console.log('This state', this.state.shouldUpdate);
        // console.log('This prev state', prevState.shouldUpdate);
    }

    private showDialog = (marker) => {
        const {showDialogContent} = this.props;
        if (marker instanceof Station) {
            showDialogContent(
                {
                    content: (
                        <EditStationDialog selectedItem={marker} />
                    ),
                    header: (
                        <Text>Edit Stations ({marker.id})</Text>
                    )
                }
            );
        } else if (marker instanceof Parcel) {
            showDialogContent(
                {
                    content: (
                        <EditParcelDialog selectedItem={marker}/>
                    ),
                    header: (
                        <Text>Edit Parcel ({marker.id})</Text>
                    )
                }
            );
        } else if (marker instanceof Pole) {
            showDialogContent(
                {
                    content: (
                        <EditPoleDialog selectedItem={marker} />
                    ),
                    header: (
                        <Text>Edit Pole ({marker.id})</Text>
                    )
                }
            );
        } else if (marker instanceof Segment) {
            showDialogContent(
                {
                    content: (
                        <EditSegmentDialog selectedItem={marker} />
                    ),
                    header: (
                        <Text>Edit Segment ({marker.id})</Text>
                    )
                }
            );
        } else if (marker instanceof Poi) {
            showDialogContent(
                {
                    content: (
                        <EditPoiDialog selectedItem={marker} />
                    ),
                    header: (
                        <Text>Edit Poi ({marker.id})</Text>
                    )
                }
            );
        }
    };

    private renderStations = (stations: Array<Station>, show: boolean, search: string) => {
        this.cluster = this.cluster.filter((entity) => entity.type !== this.MARKER_TYPE.STATION);

        if(!show || !stations.length) return;

        const markers: Array<any> = [];

        for(let i = 0, list: Array<any> = this.entityFilter(stations, search); i < list.length; i++) {
            markers.push(list[i]);
        }

        const entities: Array<any> = [];

        markers.forEach((marker) => {
            entities.push(
                <Marker
                    key={marker.id}
                    coordinate={marker.points.toGPS()}
                    image={Platform.OS === 'ios' ? require('../../../assets/images/station.png') : require('../../../assets/images/station-x4.png')}
                    onCalloutPress={() => this.showDialog(marker)}
                >
                    <Callout
                        tooltip={false}
                    >
                        <View style={{maxWidth: 170, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff'}}>
                            <Text style={{color: '#000', fontSize: 12, fontWeight: 'bold'}}>{marker['nazw_stac']}</Text>
                        </View>
                    </Callout>
                </Marker>
            )
        });

        this.cluster.push({
            type: this.MARKER_TYPE.STATION,
            markers: entities
        })
    };
    private renderPoles = (poles: Array<Pole>, show: boolean, search: string) => {
        this.cluster = this.cluster.filter((entity) => entity.type !== this.MARKER_TYPE.POLE);

        if(!show || !poles.length) return;

        const markers: Array<any> = [];

        for(let i = 0, list: Array<any> = this.entityFilter(poles, search); i < list.length; i++) {
            markers.push(list[i]);
        }

        const entities: Array<any> = [];

        markers.forEach((marker) => {
            entities.push(
                <Marker
                    key={marker.id}
                    coordinate={marker.points.toGPS()}
                    image={Platform.OS === 'ios' ? require('../../../assets/images/pole.png') : require('../../../assets/images/pole-x4.png')}
                    onCalloutPress={() => this.showDialog(marker)}
                >
                    <Callout
                        tooltip={false}
                    >
                        <View style={{maxWidth: 170, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff'}}>
                            <Text style={{color: '#000', fontSize: 12, fontWeight: 'bold'}}>{marker['num_slup']}</Text>
                        </View>
                    </Callout>
                </Marker>
            )
        });

        this.cluster.push({
            type: this.MARKER_TYPE.POLE,
            markers: entities
        })
    };
    private renderPois = (pois: Array<Poi>, show: boolean, search: string) => {
        //
        // this.setState({
        //     forceUpdate: true
        // });

        // this.forceRender = true;

        this.cluster = this.cluster.filter((entity) => entity.type !== this.MARKER_TYPE.POI);

        if(!show || !pois.length) return;

        const markers: Array<any> = [];

        for(let i = 0, list: Array<any> = this.entityFilter(pois, search); i < list.length; i++) {
            markers.push(list[i]);
        }

        const entities: Array<any> = [];

        markers.forEach((marker) => {
            entities.push(
                <Marker
                    key={marker.id}
                    coordinate={marker.points.toGPS()}
                    image={Platform.OS === 'ios' ? require('../../../assets/images/poi.png') : require('../../../assets/images/poi-x4.png')}
                    onCalloutPress={() => this.showDialog(marker)}
                >
                    <Callout
                        tooltip={false}
                    >
                        <View style={{maxWidth: 170, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff'}}>
                            <Text style={{color: '#000', fontSize: 12, fontWeight: 'bold'}}>{marker['title']}</Text>
                        </View>
                    </Callout>
                </Marker>
            )
        });

        this.cluster.push({
            type: this.MARKER_TYPE.POI,
            markers: entities
        });

        // this.forceRender = false;
    };
    private renderSegments = (segments: Array<Segment>, show: boolean, search: string) => {
        this.cluster = this.cluster.filter((entity) => entity.type !== this.MARKER_TYPE.SEGMENT);

        if(!show || !segments.length) return;

        const markers: Array<any> = [];

        for(let i = 0, list: Array<any> = this.entityFilter(segments, search); i < list.length; i++) {
            markers.push(list[i]);
        }

        const entities: Array<any> = [];

        markers.map((marker) => {
            let color: string = '';
            switch (marker.status) {
                case segment_statuses[0].value: {
                    color = 'blue';
                    break;
                }
                case segment_statuses[1].value: {
                    color = 'yellow';
                    break;
                }
                case segment_statuses[2].value: {
                    color = 'orange';
                    break;
                }
                case segment_statuses[3].value: {
                    color = 'red';
                    break;
                }
                case segment_statuses[4].value: {
                    color = 'green';
                    break;
                }
                case segment_statuses[5].value: {
                    color = 'grey';
                    break;
                }
                case segment_statuses[6].value: {
                    color = 'magenta';
                    break;
                }
            }

            entities.push(
                <Polyline
                    key={marker.id}
                    coordinates={marker.pathList}
                    strokeWidth={4}
                    strokeColor={color}
                    tappable={true}
                    //  cluster={false}
                    //  onCalloutPress={() => this.showDialog(marker)}
                    onPress={() => this.showDialog(marker)}
                />
            );
        });

        this.cluster.push({
            type: this.MARKER_TYPE.SEGMENT,
            markers: entities
        })
    };
    private renderParcels = (parcels: Array<Parcel>, show: boolean, search: string) => {
        this.cluster = this.cluster.filter((entity) => entity.type !== this.MARKER_TYPE.PARCEL);

        if(!show || !parcels.length) return;


        const markers: Array<any> = [];

        for(let i = 0, list: Array<any> = this.entityFilter(parcels, search); i < list.length; i++) {
            markers.push(list[i]);
        }

        const entities: Array<any> = [];

        markers.forEach((marker) => {
            let color: string = '';
            switch (marker.status) {
                case parcel_statuses[0].value: {
                    color = 'blue';
                    break;
                }
                case parcel_statuses[1].value: {
                    color = 'green';
                    break;
                }
                case parcel_statuses[2].value: {
                    color = 'red';
                    break;
                }
            }

            entities.push(
                <Polygon
                    key={marker.id}
                    coordinates={marker.pathList}
                    strokeWidth={4}
                    strokeColor={color}
                    tappable={true}
                    // onCalloutPress={() => this.showDialog(marker)}
                    onPress={() => this.showDialog(marker)}
                />
            );
        });

        this.cluster.push({
            type: this.MARKER_TYPE.PARCEL,
            markers: entities
        })
    };

    private handleAllowToAddPoi = () => {
        const {project, showDialogContent, showAlert} = this.props;

        if (!project) {
            return showAlert('Please select Project first');
        }

        Alert.alert(
            'POI Location',
            '',
            [
                { text: 'Use GPS',
                    onPress: async () => {
                        await this.handleGetLocation();

                        const coordinates = [
                            this.state.location.longitude,
                            this.state.location.latitude
                        ];

                        showDialogContent(
                            {
                                content: (
                                    <EditPoiDialog
                                        selectedItem={new Poi({projectId: this.props.project ? this.props.project.id : -1})}
                                        position={new Geometry(Geometry.TYPE.POINT, coordinates)}
                                    />
                                ),
                                header: (
                                    <Text>Add poi</Text>
                                )
                            }
                        );
                    }
                },
                { text: 'Choose on map',
                    onPress: () => {
                        this.props.changeControls({
                            name: 'allowAddPoi',
                            value: true
                        });
                        this.props.changeControls({
                            name: 'showPois',
                            value: true
                        });
                    }
                },
                {
                    text: 'Cancel',
                    onPress: () => {
                        this.props.changeControls({
                            name: 'allowAddPoi',
                            value: false
                        });
                    },
                    style: 'cancel',
                },
            ],
            { cancelable: true }
        );
    };

    private handleMapClick = (e: any) => {
        const {showDialogContent, allowAddPoi} = this.props;

        if (allowAddPoi) {
            const coordinate = [
                e.nativeEvent.coordinate.longitude,
                e.nativeEvent.coordinate.latitude
            ];
            showDialogContent(
                {
                    content: (
                        <EditPoiDialog
                            selectedItem={new Poi({projectId: this.props.project ? this.props.project.id : -1})}
                            position={new Geometry(Geometry.TYPE.POINT, coordinate)}/>
                    ),
                    header: (
                        <Text>Add poi</Text>
                    )
                }
            )
        }
    };

    private handleClusterClick = (cluster: any) => {
        this.setState((state) => ({
            // relocate: true,
            shouldUpdate: true,
            // forceUpdate: true,
            // isMount: false,
            expandCluster: true,
            region: {
                latitude: cluster.coordinate.latitude,
                longitude: cluster.coordinate.longitude,
                latitudeDelta: 0.09,
                longitudeDelta: 0.09
            },
            options: {
                ...state.options,
                radius: 0
            }
        }));
    };

    private handleZoomChange = (zoom: any) => {
        console.log('ZOOM', zoom);
        if(zoom >= 10) {
            // this.setState({
            //    // forceUpdate: true,
            //     options: {...this.state.options, radius: 0.005}
            // })
        } else {
            // this.setState({
            //    // forceUpdate: true,
            //     options: {...this.state.options, radius: 40}
            // })
        }
    };

    private handleGetLocation = async () => {
        let locationResult = null;
        let {status} = await Permissions.askAsync(Permissions.LOCATION);

        if(status !== 'granted') {
            locationResult = 'Permission to access location was denied';
            return this.props.showAlert(locationResult);
        }

        let location = await Location.getCurrentPositionAsync({
            enableHighAccuracy: true, timeout: 20000,
        });

        this.setState({
            location: {...location.coords},
            region: {...location.coords, latitudeDelta: 0.1, longitudeDelta: 0.1},
            shouldUpdate: true,
            showUserLocation: true,
            relocate: true,
        });

        await applyGeoposition(location);
    };

    private resetMapRender = () => {
        this.setState({
            relocate: false,
            expandCluster: false,
            // forceUpdate: false,
            expanded: true
        })
    };

    private disableUpdating = (response: any) => {
        console.log('RES=====', response);
        this.setState({
            shouldUpdate: false,
            expandCluster: false,
            relocate: false,
            status: response.status
        })
    };

    private callback = (response: any) => {
        console.log('IN CALLBACK', response);
        if(response.cluster) {
            this.setState({
                // relocate: true,
                shouldUpdate: true,
                // forceUpdate: true,
                // isMount: false,
                expandCluster: true,
                region: {
                    latitude: response.cluster.coordinate.latitude,
                    longitude: response.cluster.coordinate.longitude,
                    latitudeDelta: 0.2,
                    longitudeDelta: 0.2
                }
            });
        }
        // else if(response.status === 'initialize') {
        //     this.setState({
        //         shouldUpdate: true,
        //         initialized: true,
        //         // merged: false,
        //         // expanded: false,
        //         // region: {
        //         //     ...this.state.region,
        //         //     latitudeDelta: 0.1,
        //         //     longitudeDelta: 0.1
        //         // }
        //     })
        // }
        else if(response.status === 'expand') {
            console.log('IN CALLBACK EXPANDED');
            this.setState({
                shouldUpdate: true,
                expanded: true,
                merged: false,
                region: {
                    ...this.state.region,
                    latitudeDelta: 0.2,
                    longitudeDelta: 0.2
                }
            })
        }
        else if(response.status === 'merge') {
            console.log('IN CALLBACK MERGED');
            this.setState({
                shouldUpdate: true,
                merged: true,
                expanded: false,
                region: {
                    ...this.state.region,
                    latitudeDelta: 0.5,
                    longitudeDelta: 0.5
                }
            })
        }
        else if(response.status === 'updated') {
            this.setState({
                shouldUpdate: false,
                expandCluster: false,
                relocate: false,
                initialized: true,
                // isMount: true,
                // status: response.status
            })
        }
    };

    private entityFilter = (list: Array<any>, search: string) => {
        if(!search) return list;
        let _list = [];
        const keys = list.length ? list[0].keys() : [];
        for (let i = 0; i < list.length; i++) {
            const el: any = list[i];
            if(search) {
                let isInSearch = false;
                // console.log('------------', el);
                for(let j = 0; j < keys.length; j++) {
                    const val = el[keys[j]];
                    // console.log('search -- ', val && val.toString().toLowerCase(), search.toLowerCase());
                    if(val && val.toString().toLowerCase().match(search.toLowerCase())) {
                        // console.log('FOUND', val.toString().toLowerCase(), search.toLowerCase());
                        isInSearch = true;
                        break;
                    }
                }
                if (!isInSearch) continue;
            }
            _list.push(el);
        }
        return _list;
    };

    render() {
        return (
            <View style={{flex: 1}}>
                {
                    !this.props.isDrawerOpen && this.state.region ? (
                        <MapScreen {...this.state}
                                   cluster={this.cluster}
                                   allowAddPoi={this.props.allowAddPoi}
                                   onAllowAddPoi={this.handleAllowToAddPoi}
                                   onMapClick={this.handleMapClick}
                                   onClusterClick={this.handleClusterClick}
                                   onZoomChange={this.handleZoomChange}
                                   onGetLocation={this.handleGetLocation}
                                   callback={this.callback}
                        />
                    ) : null
                }
            </View>
        )
    }
}


const mapStateToProps = (state: any) => ({
    connection: connectionSelector(state),
    isDrawerOpen: drawerStateSelector(state),
    mapCenter: state[moduleName].mapCenter,
    selected_powerlines: powerlineSelector(state),
    dateFilter: state[moduleName].dateFilter,
    project: locationSelector(state),
    allowAddPoi: state[moduleName].allowAddPoi,

    stations: locationStationsSelector(state),
    showStations: state[moduleName].showStations,
    stationList: state[moduleName].stationList,

    poles: locationPolesSelector(state),
    showPoles: state[moduleName].showPoles,
    polesList: state[moduleName].polesList,

    parcels: locationParcelsSelector(state),
    showParcels: state[moduleName].showParcels,
    parcelList: state[moduleName].parcelList,

    segments: locationSegmentsSelector(state),
    showSegments: state[moduleName].showSegments,
    segmentList: state[moduleName].segmentList,

    pois: locationPoisSelector(state),
    showPois: state[moduleName].showPois,
    poiList: state[moduleName].poiList,

    search: searchSelector(state),
});

const mapDispatchToProps = (dispatch: any) => (
    bindActionCreators({
        showDialogContent,
        showAlert,
        changeControls,
        fetchCategories,
        fetchCategoriesOffline,
    }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(HomeScreen);
