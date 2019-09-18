import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import MapView from 'react-native-map-clustering';
import {Marker, Polygon, Polyline} from "react-native-maps";
import {Geometry, GPSCoordinate, Parcel, Poi, Pole, Project, Segment, Station} from "../../entities";
import {
    locationParcelsSelector, locationPoisSelector,
    locationPolesSelector,
    locationSegmentsSelector,
    locationSelector,
    locationStationsSelector, moduleName
} from "../../redux/modules/map";
import {showDialogContent} from "../../redux/modules/dialogs";
import {parcel_statuses, segment_statuses} from "../../redux/utils";
import {AsyncStorage, Image, View, StyleSheet, Dimensions} from "react-native";
import {Text} from 'react-native';

import EditStationDialog from './dialogs/edit.station';
import EditParcelDialog from './dialogs/edit.parcel';
import EditSegmentDialog from './dialogs/edit.segment';
import EditPoleDialog from './dialogs/edit.pole';
import AddPoiDialog from './dialogs/add.poi';
import {fetchCategories} from "../../redux/modules/admin/categories";
import {COLORS} from "../../styles/colors";
import {FabButton} from "../../components/buttons/fab.button";

interface IMapProps {
    fetchCategories: Function,
    project: Project,
    stations: Array<Station>,
    poles: Array<Pole>,
    segments: Array<Segment>,
    parcels: Array<Parcel>,
    pois: Array<Poi>,

    mapCenter: GPSCoordinate,
    showDialogContent: Function,
    search: string,

    showStations: boolean,
    showPoles: boolean,
    showSegments: boolean,
    showParcels: boolean,
    showPois: boolean,
}

class MapScreen extends Component<IMapProps> {
    private map: any;

    state = {
        //mapRegion: this.props.mapCenter,
        location: this.props.mapCenter,
        allowAddPoi: false
        // mapCenter: null,
        // hasLocationPermissions: false,
        // locationResult: null
    };

    componentDidMount(): void {
        this.props.fetchCategories();
        this.getLocationAsync();
    }

    private getLocationAsync = async () => {
        let location = await AsyncStorage.getItem('location');
        if(location) {
            const GEOPosition = JSON.parse(location);
            this.setState({
                location: {
                    latitude: GEOPosition.coords.latitude,
                    longitude: GEOPosition.coords.longitude
                }
            });
        }
    };

    private static entityFilter(list: Array<any>, search: string) {
        if(!search) return list;
        let _list = [];
        const keys = list.length ? list[0].keys() : [];
        for (let i = 0; i < list.length; i++) {
            const el: any = list[i];
            if(search) {
                let isInSearch = false;
                for(let j = 0; j < keys.length; j++) {
                    const val = el[keys[j]];
                    if(val && val.toString().toLowerCase().match(search.toLowerCase())) {
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
                        <AddPoiDialog selectedItem={marker} />
                    ),
                    header: (
                        <Text>Edit Poi ({marker.id})</Text>
                    )
                }
            );
        }
    };

    private addPoi = () => {
        this.setState({
            allowAddPoi: true
        })
    };

    private onMapClick = (e: any) => {
        const {project, showDialogContent} = this.props;
        if (!project) {
            return showDialogContent(
                {
                    content: (
                        <Text>Please select Project first</Text>
                    ),
                    header: (
                        <Text>Warning</Text>
                    )
                }
            )
        }

        this.drawInMap(e.nativeEvent.coordinate);
    };

    private drawInMap(event: any) {
        const {showDialogContent} =this.props;

        const coordinate = [
            event.latitude,
            event.longitude
        ];

        showDialogContent(
            {
                content: (
                    <AddPoiDialog
                        selectedItem={new Poi({projectId: this.props.project ? this.props.project.id : -1})}
                        position={new Geometry(Geometry.TYPE.POINT, coordinate)}/>
                ),
                header: (
                    <Text>Add poi</Text>
                )
            }
        );
    };

    private  handleMapRegionChange = mapRegion => {
        this.setState({mapRegion})
    };

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
                image={require('../../../assets/images/station.png')}
                onPress={() => this.showDialog(marker)}
            />
        ));
    }

    private renderPoles() {
        const {poles, search} = this.props;
        const markers: Array<any> = [];
        for(let i = 0, list: Array<any> = MapScreen.entityFilter(poles, search); i < list.length; i++) {
            markers.push(list[i]);
        }

        return markers.map((marker: Station) => (
            <Marker
                key={marker.id}
                coordinate={marker.points.toGPS()}
                image={require('../../../assets/images/pole.png')}
                onPress={() => this.showDialog(marker)}
            />
        ));
    }

    private renderPois() {
        const {pois, search} = this.props;
        const markers: Array<any> = [];
        for(let i = 0, list: Array<any> = MapScreen.entityFilter(pois, search); i < list.length; i++) {
            markers.push(list[i]);
        }

        return markers.map((marker: Station) => (
            <Marker
                key={marker.id}
                coordinate={marker.points.toGPS()}
                image={require('../../../assets/images/poi.png')}
                onPress={() => this.showDialog(marker)}
            />
        ));
    }

    private renderSegments() {
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
        const {location} = this.state;
        const {
            showStations,
            showSegments,
            showParcels,
            showPoles,
            showPois,
        } = this.props;

        return (
            <React.Fragment>
                <MapView
                    style={{flex: 1}}
                    onPress={this.onMapClick}
                    //onRegionChange={this.handleMapRegionChange}
                    ref={ref => {
                        this.map = ref;
                    }}
                    region={{
                        ...location,
                        latitudeDelta: 2,
                        longitudeDelta: 2
                    }}
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
                <FabButton
                    style={localStyles.button}
                    onPress={this.addPoi}
                />
                {
                    this.state.allowAddPoi ? (
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
    button: {
        position: 'absolute',
        bottom: 20,
        right: 20
    },
    allowAddPoi: {
        width: Dimensions.get('window').width,
        flex: 1,
        alignSelf: 'center',
        justifyContent: 'center',
        position: 'absolute',
        top: 140,
        left: 0,
        padding: 20,
        backgroundColor: 'white',
        textAlign: 'center',
       // opacity: 0.9
    },
    allowAddPoiText: {
        color: COLORS.PRIMARY,
      //  opacity: 0.7
    },
});

const mapStateToProps = (state: any) => ({
    project: locationSelector(state),
    stations: locationStationsSelector(state),
    poles: locationPolesSelector(state),
    segments: locationSegmentsSelector(state),
    parcels: locationParcelsSelector(state),
    pois: locationPoisSelector(state),

    mapCenter: state[moduleName].mapCenter,

    showStations: state[moduleName].showStations,
    showPoles: state[moduleName].showPoles,
    showSegments: state[moduleName].showSegments,
    showParcels: state[moduleName].showParcels,
    showPois: state[moduleName].showPois
});

const mapDispatchToProps = (dispatch: any) => (
    bindActionCreators({
        showDialogContent,
        fetchCategories
    }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(MapScreen);