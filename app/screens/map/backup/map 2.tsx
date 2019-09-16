import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import MapView from 'react-native-map-clustering';
import {Marker, Polygon, Polyline} from "react-native-maps";
import * as Location from "expo-location";
import * as Permissions from 'expo-permissions';
import {GPSCoordinate, Parcel, Poi, Pole, Project, Segment, Station} from "../../entities";
import {
    locationParcelsSelector, locationPoisSelector,
    locationPolesSelector,
    locationSegmentsSelector,
    locationSelector,
    locationStationsSelector, moduleName
} from "../../redux/modules/map";
import {showDialogContent} from "../../redux/modules/dialogs";
import {parcel_statuses, segment_statuses} from "../../redux/utils";
import {AsyncStorage} from "react-native";

interface IMapProps {
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
        mapRegion: this.props.mapCenter,
        location: this.props.mapCenter,
        // mapCenter: null,
        // hasLocationPermissions: false,
        // locationResult: null
    };

    componentDidMount(): void {
        this.getLocationAsync();
    }

    private getLocationAsync = async () => {
        // let {status} = await Permissions.askAsync(Permissions.LOCATION);
        // if(status !== 'granted') {
        //     this.setState({
        //        locationResult: 'Permission to access location was denied'
        //     });
        // } else {
        //     this.setState({
        //         hasLocationPermissions: true
        //     })
        // }
        //
        // let location = await Location.getCurrentPositionAsync({});
        // this.setState({
        //     locationResult: JSON.stringify(location)
        // });
        //
        // this.setState({
        //    mapCenter: {
        //        latitude: location.coords.latitude,
        //        longitude: location.coords.longitude
        //    }
        // });

        let location = await AsyncStorage.getItem('location');
        if(location) {
            const GEOPosition = JSON.parse(location);
            //console.log(GEOPosition);
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

    };

    private onMapClick() {}

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
                    strokeWidth={2}
                    strokeColor={color}
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
                    strokeWidth={2}
                    strokeColor={color}
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
        console.log('center', location);
        return (
            <MapView
                style={{flex: 1}}
                onPress={this.onMapClick}
                // onRegionChange={this.handleMapRegionChange}
                ref={ref => {
                    this.map = ref;
                }}
                region={{
                    ...location,
                    latitudeDelta: 4,
                    longitudeDelta: 4
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
        )
    }
}


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
    }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(MapScreen);