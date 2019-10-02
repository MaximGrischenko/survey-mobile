import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as Location from "expo-location";
import * as Permissions from 'expo-permissions';
import MapView from 'react-native-map-clustering';
import {Marker, Polygon, Polyline} from "react-native-maps";
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
import {AsyncStorage, Image, View, StyleSheet, Dimensions, TouchableOpacity, Platform, Text} from "react-native";

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

interface IMapProps {
    selected_powerlines: Array<number>,
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
}

interface IMapState {
    region: any,
    radius: number
}

class MapScreen extends Component<IMapProps, IMapState> {
    private map: any;

    constructor(p) {
        super(p);
        this.state = {
            region: null,
            radius: 5
        }
    }

    state = {
        //mapRegion: this.props.mapCenter,
        region: null,
        radius: 5,
        //allowAddPoi: false
        // mapCenter: null,
        // hasLocationPermissions: false,
        // locationResult: null

    };

    async componentDidMount() {
        this.props.fetchCategories();
        let location = await AsyncStorage.getItem('location');

        const region = {
            latitude: null,
            longitude: null,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1
        };

        if(location) {
            const GEOPosition = JSON.parse(location);
            region.latitude = GEOPosition.coords.latitude;
            region.longitude = GEOPosition.coords.longitude;

            this.setState({
                region
            });
        } else {
            region.latitude = this.props.mapCenter.latitude;
            region.longitude = this.props.mapCenter.longitude;

            this.setState({
                region
            })
        }

        await applyGeoposition(location);

        this.moveToLocation(this.state.region, 2000);
    }

    // componentDidUpdate(prevProps: Readonly<IMapProps>, prevState: Readonly<{}>, snapshot?: any): void {
    // }

    // static getDerivedStateFromProps(props: Readonly<IMapProps>, state: Readonly<IMapState>): IMapState{
    //     if(props.project && (props.stations.length || props.poles.length || props.segments.length || props.parcels.length)) {
    //         const coordinates = props.stations[0].points.toGPS();
    //        console.log('cc', coordinates);
    //         return {
    //             region: {
    //                 latitude: 10,
    //                 longitute: 10,
    //                 latitudeDelta: 0.5,
    //                 longitudeDelta: 0.5
    //             },
    //             radius: 10
    //         }
    //     }
    //     return null;
    // }



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

        this.setState({
            region: {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.1,
                longitudeDelta: 0.1,
            },
        });
        await applyGeoposition(location);

        this.moveToLocation(this.state.region, 2000);
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
        this.props.changeControls({
            name: 'allowAddPoi',
            value: Date.now()
        });
        this.props.changeControls({
            name: 'showPois',
            value: true
        });
    };

    private onMapClick = (e: any) => {
        const {project, showAlert, showDialogContent, allowAddPoi} = this.props;
        if (!project && allowAddPoi) {
            return showAlert('Please select Project first');
        }

        if (this.props.allowAddPoi) {
            //    this.drawInMap(e.nativeEvent.coordinate);
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

    // private drawInMap(event: any) {
    //     const {showDialogContent} = this.props;
    //
    //     const coordinate = [
    //         event.longitude,
    //         event.latitude
    //     ];
    //
    //     showDialogContent(
    //         {
    //             content: (
    //                 <EditPoiDialog
    //                     selectedItem={new Poi({projectId: this.props.project ? this.props.project.id : -1})}
    //                     position={new Geometry(Geometry.TYPE.POINT, coordinate)}/>
    //             ),
    //             header: (
    //                 <Text>Add poi</Text>
    //             )
    //         }
    //     );
    // }

    private onClusterPress = (cluster) => {
        const coordinates = cluster.geometry.coordinates;
        let region = {
            latitude: coordinates[1],
            longitude: coordinates[0],
            latitudeDelta: 0.5,
            longitudeDelta: 0.5,
        };


        this.map.root.animateToRegion(region, 2000);
    };

    private moveToLocation = (region, duration) => {
        this.map.root.animateToRegion(region, duration);
    };

    // private onRegionChangeComplete = () => {
    //     this.setState({
    //         radius: 0.5
    //     })
    // };

    // private moveToCurrentLocation = () => {
    //     let region = {
    //         latitude: this.state.region.latitude,
    //         longitude: this.state.region.longitude,
    //         latitudeDelta: 0.1,
    //         longitudeDelta: 0.1,
    //     };
    //     this.map.root.animateToRegion(region, 2000);
    // };
    //
    // private  handleMapRegionChange = mapRegion => {
    //     this.setState({mapRegion})
    // };

    private renderStations() {
        const {stations, search} = this.props;
        const markers: Array<any> = [];
        for(let i = 0, list: Array<any> = MapScreen.entityFilter(stations, search); i < list.length; i++) {
            markers.push(list[i]);
        }

        return markers.map((marker: Station) => (
            <Marker
                key={marker.id}
                coordinate={marker.points.toGPS()}
                image={Platform.OS === 'ios' ? require('../../../assets/images/station.png') : require('../../../assets/images/station-x4.png')}
                onPress={() => this.showDialog(marker)}
            />
        ));
    }

    private renderPoles() {
        // if(!search) search = this.props.search;
        const {poles, search} = this.props;
        const markers: Array<any> = [];
        for(let i = 0, list: Array<any> = MapScreen.entityFilter(poles, search); i < list.length; i++) {
            markers.push(list[i]);
        }

        return markers.map((marker: Station) => (
            <Marker
                key={marker.id}
                coordinate={marker.points.toGPS()}
                image={Platform.OS === 'ios' ? require('../../../assets/images/pole.png') : require('../../../assets/images/pole-x4.png')}
                onPress={() => this.showDialog(marker)}
            />
        ));
    }

    private renderPois() {
        //  if(!search) search = this.props.search;
        const {pois, search} = this.props;

        const markers: Array<any> = [];
        for(let i = 0, list: Array<any> = MapScreen.entityFilter(pois, search); i < list.length; i++) {
            // console.log('PUSH', list[i]);
            markers.push(list[i]);
        }

        return markers.map((marker: Station) => (
            <Marker
                key={marker.id}
                coordinate={marker.points.toGPS()}
                image={Platform.OS === 'ios' ? require('../../../assets/images/poi.png') : require('../../../assets/images/poi-x4.png')}
                onPress={() => this.showDialog(marker)}
            />
        ));
    }

    private renderSegments() {
        //  if(!search) search = this.props.search;
        const {segments, search} = this.props;
        const markers: Array<any> = [];
        for(let i = 0, list: Array<any> = MapScreen.entityFilter(segments, search); i < list.length; i++) {
            markers.push(list[i]);
        }
        return markers.map((marker: Segment) => {
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

            return (
                <Polyline
                    key={marker.id}
                    coordinates={marker.pathList}
                    strokeWidth={8}
                    strokeColor={color}
                    tappable={true}
                    onPress={() => this.showDialog(marker)}
                />
            )
        })
    }

    private renderParcels() {
        // if(!search) search = this.props.search;
        const {parcels, search} = this.props;
        const markers: Array<any> = [];
        for(let i = 0, list: Array<any> = MapScreen.entityFilter(parcels, search); i < list.length; i++) {
            markers.push(list[i]);
        }

        return markers.map((marker: Parcel) => {
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

            return (
                <Polygon
                    key={marker.id}
                    coordinates={marker.pathList}
                    strokeWidth={4}
                    strokeColor={color}
                    tappable={true}
                    onPress={() => this.showDialog(marker)}
                />
            )
        })
    }

    render() {
        const {region} = this.state;
        const {
            showStations,
            showSegments,
            showParcels,
            showPoles,
            showPois,
        } = this.props;

        // console.log('MAP', this.map);
        console.log(showPoles);

        return (
            <React.Fragment>
                <MapView
                    style={{flex: 1}}
                    onPress={this.onMapClick}
                    // radius={this.state.radius}
                    // onClusterPress={this.onClusterPress}
                    // onRegionChange={this.handleMapRegionChange}
                    // onRegionChangeComplete={this.onRegionChangeComplete}
                    ref={ref => {
                        this.map = ref;
                    }}
                    region={region}
                >
                    {
                        showStations ? (
                            this.renderStations()
                        ) : null
                    }
                    {
                        showSegments ? (
                            this.renderSegments()
                        ) : null
                    }
                    {
                        showParcels ? (
                            this.renderParcels()
                        ) : null
                    }
                    {
                        showPoles ? (
                            this.renderPoles()
                        ) : null
                    }
                    {
                        showPois ? (
                            this.renderPois()
                        ) : null
                    }
                </MapView>
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
    search: searchSelector(state)
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