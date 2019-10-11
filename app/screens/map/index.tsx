import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as Location from "expo-location";
import * as Permissions from 'expo-permissions';
import MapView from 'react-native-map-clustering';
import {ClusterMap} from 'react-native-cluster-map';
import {Callout, Marker, Polygon, Polyline} from "react-native-maps";
import {Geometry, GPSCoordinate, Parcel, Poi, Pole, Project, Segment, Station} from "../../entities";
import {
    applyGeoposition,
    changeControls,
    locationParcelsSelector, locationPoisSelector,
    locationPolesSelector,
    locationSegmentsSelector,
    locationSelector,
    locationStationsSelector, moduleName, powerlineSelector
} from "../../redux/modules/map";
import {showAlert, showDialogContent} from "../../redux/modules/dialogs";
import {parcel_statuses, segment_statuses} from "../../redux/utils";
import {AsyncStorage, Image, View, StyleSheet, Dimensions, TouchableOpacity, Platform, Text, Alert} from "react-native";

import EditStationDialog from '../../components/dialog.component/dialogs/edit.station';
import EditParcelDialog from '../../components/dialog.component/dialogs/edit.parcel';
import EditSegmentDialog from '../../components/dialog.component/dialogs/edit.segment';
import EditPoleDialog from '../../components/dialog.component/dialogs/edit.pole';
import EditPoiDialog from '../../components/dialog.component/dialogs/edit.poi';
import {fetchCategories} from "../../redux/modules/admin/categories";
import {COLORS} from "../../styles/colors";
import {FabButton} from "../../components/buttons/fab.button";
import {searchSelector} from "../../redux/modules/auth";
import Icon from "react-native-vector-icons/Ionicons";
import _ from 'lodash';
import {connectionSelector} from "../../redux/modules/connect";

interface IMapProps {
    selected_powerlines: Array<number>,
    dateFilter: any,
    fetchCategories: Function,
    project: Project,
    stations: Array<Station>,
    poles: Array<Pole>,
    segments: Array<Segment>,
    parcels: Array<Parcel>,
    pois: Array<Poi>,
    allowAddPoi: any,
    mapCenter: GPSCoordinate,
    showDialogContent: Function,
    search: string,
    changeControls: Function,
    showAlert: any,
    showStations: boolean,
    showPoles: boolean,
    showSegments: boolean,
    showParcels: boolean,
    showPois: boolean,
    stationList: any,
    segmentList: any,
    poiList: any,
    polesList: any,
    parcelList: any,

    connection: any
}

interface IMapState {
   // initial: any,
    region: any,
    //radius: number,
    showUserLocation: boolean,
   // isShowTooltip: boolean,
    location: any,
    options: any,
}

class MapScreen extends Component<IMapProps, IMapState> {
    private map: any;
    private cluster: Array<any> = [];
    private MARKER_TYPE: any = {
        STATION: 1,
        PARCEL: 2,
        SEGMENT: 3,
        POLE: 4,
        POI: 5
    };
    private tooltip: any;

    private stationList: any;
    private segmentList: any;
    private poiList: any;
    private polesList: any;
    private parcelList: any;

    state = {
        //mapRegion: this.props.mapCenter,
        location: null,
        options: {
            radius: 40,
            nodeSize: 25,
            maxZoom: 10,
            minZoom: 1
        },
        showUserLocation: false,
       // radius: 40,
       // cluster: [],
        // region: this.props.mapCenter,
      //  initial: null,
        region: null,
       // isShowTooltip: false,
       // region: {...this.props.mapCenter, latitudeDelta: 0.1, longitudeDelta: 0.1}
        //allowAddPoi: false
        // mapCenter: null,
        // hasLocationPermissions: false,
        // locationResult: null

    };

    async componentDidMount(){
        this.props.fetchCategories();

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

        this.setState({
            region,
        });
    }

    componentWillReceiveProps(nextProps: Readonly<IMapProps>, nextContext: any): void {
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
            nextProps.selected_powerlines.length !== this.props.selected_powerlines.length
        ) {
            this.renderStations(nextProps.stations, nextProps.showStations, nextProps.search);
            this.renderPoles(nextProps.poles, nextProps.showPoles, nextProps.search);
            this.renderPois(nextProps.pois, nextProps.showPois, nextProps.search);
            this.renderSegments(nextProps.segments, nextProps.showSegments, nextProps.search);
            this.renderParcels(nextProps.parcels, nextProps.showParcels, nextProps.search);
        }

        if(!_.isEqual(nextProps.stations, this.props.stations) && nextProps.stations.length) {
            const location = nextProps.stations[Math.round(nextProps.stations.length / 2)].points.toGPS();
            const region = {...location, latitudeDelta: 1, longitudeDelta: 1};
            this.moveToLocation(region, 2000);
        }
    }

    // componentDidUpdate(prevProps: Readonly<IMapProps>, prevState: Readonly<IMapState>, snapshot?: any): void {
    //     // if(!_.isEqual(prevProps.stations, this.props.stations) && this.props.stations.length) {
    //     //     const location = this.props.stations[Math.round(this.props.stations.length / 2)].points.toGPS();
    //     //     const region = {...location, latitudeDelta: 1, longitudeDelta: 1};
    //     //     this.moveToLocation(region, 200);
    //     // }
    // }

    componentWillUnmount(): void {
        console.log('unmounted');
    }

    private getLocationAsync = async () => {
        let hasLocationPermissions = false;
        let locationResult = null;

        let {status} = await Permissions.askAsync(Permissions.LOCATION);

        if(status !== 'granted') {
            locationResult = 'Permission to access location was denied';
            this.props.showAlert(locationResult);
        } else {
            hasLocationPermissions = true;
        }

        let location = await Location.getCurrentPositionAsync({
            enableHighAccuracy: true, timeout: 20000,
        });

        const region = {...location.coords, latitudeDelta: 0.1, longitudeDelta: 0.1};

        this.setState({
            location: {...location.coords},
            showUserLocation: true
        });

        await applyGeoposition(location);

        this.moveToLocation(region, 2000);
    };

    private static entityFilter(list: Array<any>, search: string) {
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

    private onAllowToAddPoi = () => {
        let useGps = false;
        const {project, showDialogContent, showAlert} = this.props;
        Alert.alert(
            'POI Location',
            '',
            [
                { text: 'Use GPS', onPress: async () => {
                        let hasLocationPermissions = false;
                        let locationResult = null;
                        let {status} = await Permissions.askAsync(Permissions.LOCATION);
                        console.log(status);
                        if(status !== 'granted') {
                            locationResult = 'Permission to access location was denied';
                            showAlert(locationResult);
                        } else {
                            if (!project) {
                                showAlert('Please select Project first');
                            } else {
                                let location = await Location.getCurrentPositionAsync({
                                    enableHighAccuracy: true, timeout: 20000,
                                });

                                const coordinate = [
                                    location.coords.longitude,
                                    location.coords.latitude
                                ];

                                showDialogContent(
                                    {
                                        content: (
                                            <EditPoiDialog
                                                selectedItem={new Poi({projectId: this.props.project ? this.props.project.id : -1})}
                                                position={new Geometry(Geometry.TYPE.POINT, coordinate)}
                                            />
                                        ),
                                        header: (
                                            <Text>Add poi</Text>
                                        )
                                    }
                                )
                                // useGps = true
                            }
                        }

                    }
                },
                { text: 'Choose on map', onPress: () => {

                        this.props.changeControls({
                            name: 'allowAddPoi',
                            value: Date.now()
                        });
                        this.props.changeControls({
                            name: 'showPois',
                            value: true
                        });
                    }
                },
                {
                    text: 'Cancel',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel',
                },
            ],
            { cancelable: true }
        );

    };

    private onMapClick = (e: any) => {
        const {project, showAlert, showDialogContent, allowAddPoi} = this.props;
        if (!project && allowAddPoi) {
            return showAlert('Please select Project first');
        }

        if (this.props.allowAddPoi) {
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

    // private onClusterPress = (cluster) => {
    //     const coordinates = cluster.geometry.coordinates;
    //
    //     const region = {
    //         latitude: coordinates[1],
    //         longitude: coordinates[0],
    //         latitudeDelta: this.state.region.latitudeDelta * 0.01,
    //         longitudeDelta: this.state.region.latitudeDelta * 0.01,
    //     };
    //
    //     this.setState({
    //        // region,
    //         radius: 0.01,
    //     });
    //
    //     this.map.root.animateToRegion(region, 1500);
    // };

    // private onZoomChange = (zoom) => {
    //     console.log('zoom changed', zoom);
    //     switch (zoom) {
    //         case 6: {
    //             this.setState({
    //                 radius: 40
    //             })
    //         } break;
    //         case 10: {
    //             this.setState({
    //                 radius: 0.1
    //             })
    //         }
    //     }
    // };

    private moveToLocation = (region, duration) => {
        this.map.mapRef.animateToRegion(region, duration);
        this.setState({ region })
    };

    private renderStations = (stations: Array<Station>, show: boolean, search: string) => {
        this.cluster = this.cluster.filter((entity) => entity.type !== this.MARKER_TYPE.STATION);

        if(!show || !stations.length) return;


        const markers: Array<any> = [];

        for(let i = 0, list: Array<any> = MapScreen.entityFilter(stations, search); i < list.length; i++) {
            markers.push(list[i]);
        }

        const entities: Array<any> = [];

        markers.map((marker) => {
           entities.push(
                <Marker
                    key={marker.id}
                    coordinate={marker.points.toGPS()}
                    image={Platform.OS === 'ios' ? require('../../../assets/images/station.png') : require('../../../assets/images/station-x4.png')}
                    // title={marker['nazw_stac']}
                    // onPress={() => this.showDialog(marker)}
                    // onPress={() => this.tooltip.toggleTooltip()}
                    onCalloutPress={() => this.showDialog(marker)}
                >
                    <Callout
                        tooltip={false}
                        //  onPress={(e) => this.onWaypointCallout(marker, this.state.markers)}
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

        for(let i = 0, list: Array<any> = MapScreen.entityFilter(poles, search); i < list.length; i++) {
            markers.push(list[i]);
        }

        const entities: Array<any> = [];

        markers.map((marker) => {
            entities.push(
                <Marker
                    key={marker.id}
                    coordinate={marker.points.toGPS()}
                    image={Platform.OS === 'ios' ? require('../../../assets/images/pole.png') : require('../../../assets/images/pole-x4.png')}
                 //   onPress={() => this.showDialog(marker)}
                    onCalloutPress={() => this.showDialog(marker)}
                >
                    <Callout
                        tooltip={false}
                        //  onPress={(e) => this.onWaypointCallout(marker, this.state.markers)}
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
        this.cluster = this.cluster.filter((entity) => entity.type !== this.MARKER_TYPE.POI);

        if(!show || !pois.length) return;

        const markers: Array<any> = [];

        for(let i = 0, list: Array<any> = MapScreen.entityFilter(pois, search); i < list.length; i++) {
            markers.push(list[i]);
        }

        const entities: Array<any> = [];

        markers.map((marker) => {
            entities.push(
                <Marker
                    key={marker.id}
                    coordinate={marker.points.toGPS()}
                    // cluster={false}
                    image={Platform.OS === 'ios' ? require('../../../assets/images/poi.png') : require('../../../assets/images/poi-x4.png')}
                    //  onPress={() => this.showDialog(marker)}
                    onCalloutPress={() => this.showDialog(marker)}
                >
                    <Callout
                        tooltip={false}
                        //  onPress={(e) => this.onWaypointCallout(marker, this.state.markers)}
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
        })
    };

    private renderSegments = (segments: Array<Segment>, show: boolean, search: string) => {
        this.cluster = this.cluster.filter((entity) => entity.type !== this.MARKER_TYPE.SEGMENT);

        if(!show || !segments.length) return;

        const markers: Array<any> = [];

        for(let i = 0, list: Array<any> = MapScreen.entityFilter(segments, search); i < list.length; i++) {
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

        for(let i = 0, list: Array<any> = MapScreen.entityFilter(parcels, search); i < list.length; i++) {
            markers.push(list[i]);
        }

        const entities: Array<any> = [];

        markers.map((marker) => {
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

    private renderCluster = () => {
       return this.cluster.reduce((acc, entity) => [...acc, ...entity.markers], []);
    };

    // private renderStations() {
    //     const {stations, search} = this.props;
    //     const markers: Array<any> = [];
    //     for(let i = 0, list: Array<any> = MapScreen.entityFilter(stations, search); i < list.length; i++) {
    //         markers.push(list[i]);
    //     }
    //
    //     return markers.map((marker: Station) => (
    //         <Marker
    //             key={marker.id}
    //             coordinate={marker.points.toGPS()}
    //             image={Platform.OS === 'ios' ? require('../../../assets/images/station.png') : require('../../../assets/images/station-x4.png')}
    //            // title={marker['nazw_stac']}
    //             // onPress={() => this.showDialog(marker)}
    //            // onPress={() => this.tooltip.toggleTooltip()}
    //             onCalloutPress={() => this.showDialog(marker)}
    //         >
    //             <Callout
    //                 tooltip={false}
    //               //  onPress={(e) => this.onWaypointCallout(marker, this.state.markers)}
    //             >
    //                 <View style={{maxWidth: 170, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff'}}>
    //                     <Text style={{color: '#000', fontSize: 12, fontWeight: 'bold'}}>{marker['nazw_stac']}</Text>
    //                 </View>
    //             </Callout>
    //         </Marker>
    //     ));
    // }

    // private renderPoles() {
    //    // if(!search) search = this.props.search;
    //     const {poles, search} = this.props;
    //     const markers: Array<any> = [];
    //     for(let i = 0, list: Array<any> = MapScreen.entityFilter(poles, search); i < list.length; i++) {
    //         markers.push(list[i]);
    //     }
    //
    //     return markers.map((marker: Station) => (
    //         <Marker
    //             key={marker.id}
    //             coordinate={marker.points.toGPS()}
    //             image={Platform.OS === 'ios' ? require('../../../assets/images/pole.png') : require('../../../assets/images/pole-x4.png')}
    //          //   onPress={() => this.showDialog(marker)}
    //             onCalloutPress={() => this.showDialog(marker)}
    //         >
    //             <Callout
    //                 tooltip={false}
    //                 //  onPress={(e) => this.onWaypointCallout(marker, this.state.markers)}
    //             >
    //                 <View style={{maxWidth: 170, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff'}}>
    //                     <Text style={{color: '#000', fontSize: 12, fontWeight: 'bold'}}>{marker['num_slup']}</Text>
    //                 </View>
    //             </Callout>
    //         </Marker>
    //     ));
    // }

    // private renderPois() {
    //   //  if(!search) search = this.props.search;
    //     const {pois, search} = this.props;
    //
    //     const markers: Array<any> = [];
    //     for(let i = 0, list: Array<any> = MapScreen.entityFilter(pois, search); i < list.length; i++) {
    //         // console.log('PUSH', list[i]);
    //         markers.push(list[i]);
    //     }
    //
    //     return markers.map((marker: Station) => (
    //         <Marker
    //             key={marker.id}
    //             coordinate={marker.points.toGPS()}
    //            // cluster={false}
    //             image={Platform.OS === 'ios' ? require('../../../assets/images/poi.png') : require('../../../assets/images/poi-x4.png')}
    //           //  onPress={() => this.showDialog(marker)}
    //             onCalloutPress={() => this.showDialog(marker)}
    //         >
    //             <Callout
    //                 tooltip={false}
    //                 //  onPress={(e) => this.onWaypointCallout(marker, this.state.markers)}
    //             >
    //                 <View style={{maxWidth: 170, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff'}}>
    //                     <Text style={{color: '#000', fontSize: 12, fontWeight: 'bold'}}>{marker['title']}</Text>
    //                 </View>
    //             </Callout>
    //         </Marker>
    //     ));
    // }

    // private renderSegments() {
    //   //  if(!search) search = this.props.search;
    //     const {segments, search} = this.props;
    //     const markers: Array<any> = [];
    //     for(let i = 0, list: Array<any> = MapScreen.entityFilter(segments, search); i < list.length; i++) {
    //         markers.push(list[i]);
    //     }
    //     return markers.map((marker: Segment) => {
    //         let color: string = '';
    //         switch (marker.status) {
    //             case segment_statuses[0].value: {
    //                 color = 'blue';
    //                 break;
    //             }
    //             case segment_statuses[1].value: {
    //                 color = 'yellow';
    //                 break;
    //             }
    //             case segment_statuses[2].value: {
    //                 color = 'orange';
    //                 break;
    //             }
    //             case segment_statuses[3].value: {
    //                 color = 'red';
    //                 break;
    //             }
    //             case segment_statuses[4].value: {
    //                 color = 'green';
    //                 break;
    //             }
    //             case segment_statuses[5].value: {
    //                 color = 'grey';
    //                 break;
    //             }
    //             case segment_statuses[6].value: {
    //                 color = 'magenta';
    //                 break;
    //             }
    //         }
    //
    //         return (
    //             <Polyline
    //                 key={marker.id}
    //                 coordinates={marker.pathList}
    //                 strokeWidth={8}
    //                 strokeColor={color}
    //                 tappable={true}
    //               //  cluster={false}
    //               //  onCalloutPress={() => this.showDialog(marker)}
    //                 onPress={() => this.showDialog(marker)}
    //             />
    //         )
    //     })
    // }

    // private renderParcels() {
    //    // if(!search) search = this.props.search;
    //     const {parcels, search} = this.props;
    //     const markers: Array<any> = [];
    //     for(let i = 0, list: Array<any> = MapScreen.entityFilter(parcels, search); i < list.length; i++) {
    //         markers.push(list[i]);
    //     }
    //
    //     return markers.map((marker: Parcel) => {
    //         let color: string = '';
    //         switch (marker.status) {
    //             case parcel_statuses[0].value: {
    //                 color = 'blue';
    //                 break;
    //             }
    //             case parcel_statuses[1].value: {
    //                 color = 'green';
    //                 break;
    //             }
    //             case parcel_statuses[2].value: {
    //                 color = 'red';
    //                 break;
    //             }
    //         }
    //
    //         return (
    //             <Polygon
    //                 key={marker.id}
    //                 coordinates={marker.pathList}
    //                 strokeWidth={4}
    //                 strokeColor={color}
    //                 tappable={true}
    //                // onCalloutPress={() => this.showDialog(marker)}
    //                 onPress={() => this.showDialog(marker)}
    //             />
    //         )
    //     })
    // }

    render() {
        const {
            connection
        } = this.props;

        console.log('CONNECTION', connection);

        const {showUserLocation, options, region} = this.state;

        return (
            <View style={{flex: 1}}>
                {
                    this.state.region ? (
                        <View style={{flex: 1}}>
                            <ClusterMap
                                region={{...region}}
                                ref={ref => this.map = ref}
                                onPress={this.onMapClick}
                                //superClusterOptions={{...options}}
                                priorityMarker={
                                    showUserLocation ? (
                                        <Marker
                                            key={Date.now()}
                                            coordinate={{...this.state.location}}
                                            image={Platform.OS === 'ios' ? require('../../../assets/images/location.png') : require('../../../assets/images/location-x4.png')}
                                        />
                                    ) : null
                                }
                                // onZoomChange={(zoom) => {
                                //     console.log('ZOOM', zoom);
                                //     // if(zoom >= 10) {
                                //     //     this.setState({
                                //     //         options: {...this.state.options, radius: 0.005}
                                //     //     })
                                //     // } else {
                                //     //     this.setState({
                                //     //         options: {...this.state.options, radius: 40}
                                //     //     })
                                //     // }
                                // }}
                                // onClusterClick={() => {
                                //     console.log('CLICKED');
                                // }}
                            >
                                {
                                    this.cluster.length ? (
                                        this.renderCluster()
                                    ) : null
                                }
                            </ClusterMap>
                            {/*<MapView*/}
                            {/*    style={{flex: 1}}*/}
                            {/*    onPress={this.onMapClick}*/}
                            {/*    // radius={this.state.radius}*/}
                            {/*    onClusterPress={(cluster) => {*/}
                            {/*        // const coordinates = cluster.geometry.coordinates;*/}
                            {/*        // const region = {*/}
                            {/*        //     latitude: coordinates[1],*/}
                            {/*        //     longitude: coordinates[0],*/}
                            {/*        //     latitudeDelta: 0.1,*/}
                            {/*        //     longitudeDelta: 0.1,*/}
                            {/*        // };*/}
                            {/*        // this.setState({*/}
                            {/*        //     radius: this.state.radius * 15,*/}
                            {/*        // });*/}

                            {/*        // this.moveToLocation(region, 2000);*/}

                            {/*       // const region = regionContainingPoints(cluster.properties.all_coordinates);*/}
                            {/*       // this.root.animateToRegion(region, 100);*/}
                            {/*    }}*/}
                            {/*    // onRegionChange={this.handleMapRegionChange}*/}
                            {/*    // onRegionChangeComplete={(region) => {*/}
                            {/*    //     const {pos} = this.state.region;*/}
                            {/*    //*/}
                            {/*    //     if(pos && _.isEqual(pos, region)) {*/}
                            {/*    //         this.setState({region: region});*/}
                            {/*    //     }*/}
                            {/*    // }}*/}
                            {/*    // onRegionChangeComplete={(region) => {*/}
                            {/*    //     this.setState({region});*/}
                            {/*    // }}*/}
                            {/*    ref={ref => {*/}
                            {/*        this.map = ref;*/}
                            {/*    }}*/}
                            {/*   // region={{...this.state.region}}*/}
                            {/*    region={{*/}
                            {/*        ...this.state.region,*/}
                            {/*        // latitudeDelta: 4,*/}
                            {/*        // longitudeDelta: 4*/}
                            {/*    }}*/}
                            {/*>*/}
                            {/*    {*/}
                            {/*        showStations ? (*/}
                            {/*            this.renderStations()*/}
                            {/*        ) : null*/}
                            {/*    }*/}
                            {/*    {*/}
                            {/*        showSegments ? (*/}
                            {/*            this.renderSegments()*/}
                            {/*        ) : null*/}
                            {/*    }*/}
                            {/*    {*/}
                            {/*        showParcels ? (*/}
                            {/*            this.renderParcels()*/}
                            {/*        ) : null*/}
                            {/*    }*/}
                            {/*    {*/}
                            {/*        showPoles ? (*/}
                            {/*            this.renderPoles()*/}
                            {/*        ) : null*/}
                            {/*    }*/}
                            {/*    {*/}
                            {/*        showPois ? (*/}
                            {/*            this.renderPois()*/}
                            {/*        ) : null*/}
                            {/*    }*/}
                            {/*    {*/}
                            {/*        showUserLocation ? (*/}
                            {/*            <Marker*/}
                            {/*                key={Date.now()}*/}
                            {/*                style={{zIndex: 999}}*/}
                            {/*                coordinate={{...this.state.location}}*/}
                            {/*                cluster={false}*/}
                            {/*                image={Platform.OS === 'ios' ? require('../../../assets/images/location.png') : require('../../../assets/images/location-x4.png')}*/}
                            {/*            />*/}
                            {/*        ) : null*/}
                            {/*    }*/}
                            {/*</MapView>*/}
                            {/*<Tooltip*/}
                            {/*    ref={ref => {*/}
                            {/*        this.tooltip = ref;*/}
                            {/*    }}*/}
                            {/*    popover={<Text>AAAA</Text>}*/}
                            {/*>*/}

                            {/*</Tooltip>*/}
                        </View>
                    ) : null
                }
                <React.Fragment>
                    <TouchableOpacity style={localStyles.location} onPress={this.getLocationAsync}>
                       <Icon name={Platform.OS === 'ios' ? 'ios-locate' : 'md-locate'} size={24} color={COLORS.SECONDARY} style={localStyles.icon}/>
                    </TouchableOpacity>
                    <FabButton
                       style={localStyles.button}
                       onPress={this.onAllowToAddPoi}
                    />
                    {
                       this.props.allowAddPoi ? (
                           <View style={localStyles.allowAddPoi}>
                               <Text style={localStyles.allowAddPoiText}>Click on the map to set the location</Text>
                           </View>
                       ) : null
                    }
                </React.Fragment>
            </View>
        )
    }
}

const localStyles = StyleSheet.create({
    location: {
        position: 'absolute',
        bottom: 80,
        right: 20,

        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: 50,
        width: 50,
        borderRadius: 100,
        backgroundColor: COLORS.PRIMARY,
        shadowColor: COLORS.PRIMARY,
        shadowOpacity: 0.4,
        shadowOffset: {height: 10, width: 0},
        shadowRadius: 20
    },
    button: {
        position: 'absolute',
        bottom: 20,
        right: 20
    },
    icon: {
        color: COLORS.SECONDARY,
        height: 24,
    },
    allowAddPoi: {
        width: Dimensions.get('window').width-20,
        position: 'absolute',
        top: 140,
        left: 10,
        padding: 20,
        borderRadius: 5,
        backgroundColor: 'white',
        textAlign: 'center',
    },
    allowAddPoiText: {
        color: COLORS.PRIMARY,
    },
});

const mapStateToProps = (state: any) => ({
    selected_powerlines: powerlineSelector(state),
    dateFilter: state[moduleName].dateFilter,
    project: locationSelector(state),
    stations: locationStationsSelector(state),
    poles: locationPolesSelector(state),
    segments: locationSegmentsSelector(state),
    parcels: locationParcelsSelector(state),
    pois: locationPoisSelector(state),
    allowAddPoi: state[moduleName].allowAddPoi,
    mapCenter: state[moduleName].mapCenter,
    showStations: state[moduleName].showStations,
    showPoles: state[moduleName].showPoles,
    showSegments: state[moduleName].showSegments,
    showParcels: state[moduleName].showParcels,
    showPois: state[moduleName].showPois,
    search: searchSelector(state),
    stationList: state[moduleName].stationList,
    segmentList: state[moduleName].segmentList,
    poiList: state[moduleName].poiList,
    polesList: state[moduleName].polesList,
    parcelList: state[moduleName].parcelList,

    connection: connectionSelector(state)
});

const mapDispatchToProps = (dispatch: any) => (
    bindActionCreators({
        showDialogContent,
        showAlert,
        changeControls,
        fetchCategories
    }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(MapScreen);