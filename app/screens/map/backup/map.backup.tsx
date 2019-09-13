import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

// import MapView from 'react-native-map-clustering';
import {Callout, Marker, Polygon, Polyline} from 'react-native-maps';
import {View, Text, StyleSheet, ScrollView} from "react-native";
import {fetchCategories} from "../../redux/modules/admin/categories";
import {Geometry, GPSCoordinate, Parcel, Poi, Pole, Project, Segment, Station} from "../../entities";
import {
    locationPolesSelector,
    locationSegmentsSelector,
    locationStationsSelector,
    moduleName
} from "../../redux/modules/map";

import {MapView} from 'expo';
import ClusteredMapView from 'react-native-maps-super-cluster';

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
    showSegments: boolean,
    showParcels: boolean,
    showPoles: boolean,
    showPois: boolean,

    stationList: any,
    segmentList: any,
    polesList: any,
}

interface IMapState {
    allowAddPoi: boolean
}

class MapScreen extends Component<IMapProps, IMapState> {

    state = {
        allowAddPoi: false,
        //cluster: [],
    };

    private stationList: any;
    private segmentList: any;
    private polesList: any;

    private MARKER_TYPE: any = {
        STATION: 1,
        PARCEL: 2,
        SEGMENT: 3,
        POLE: 4,
        POI: 5
    };


    private map: any;
    private cluster: any = [];

    componentDidMount(): void {
        const nextProps = this.props;
        this.props.fetchCategories();
        this.renderStations(nextProps.stations, nextProps.showStations, nextProps.search);
        this.renderSegments(nextProps.segments, nextProps.showSegments, nextProps.search);
        this.renderPoles(nextProps.poles, nextProps.showPoles, nextProps.search);
    }

    componentWillReceiveProps(nextProps: Readonly<IMapProps>, nextContext: any): void {
        const props: any = this.props;
        if (nextProps.stationList !== this.stationList || nextProps.showStations !== this.props.showStations) {
            this.renderStations(nextProps.stations, nextProps.showStations, nextProps.search);
            this.stationList = nextProps.stationList;
        }
        if (nextProps.segmentList !== this.segmentList || nextProps.showSegments !== this.props.showSegments) {
            this.renderSegments(nextProps.segments, nextProps.showSegments, nextProps.search);
            this.segmentList = nextProps.segmentList;
        }
        if (nextProps.polesList !== this.polesList || nextProps.showPoles !== this.props.showPoles) {
            this.renderPoles(nextProps.poles, nextProps.showPoles, nextProps.search);
            this.polesList = nextProps.polesList;
        }
    }

    private entityFilter(list: Array<any>, search: string) {
        if (!search) return list;
        let _list = [];
        const keys = list.length ? list[0].keys() : [];
        for (let i = 0; i < list.length; i++) {
            const el: any = list[i];
            if (search) {
                let isInSearch = false;
                for (let j = 0; j < keys.length; j++) {
                    const val = el[keys[j]];
                    if (val && val.toString().toLowerCase().match(search.toLowerCase())) {
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

    private renderStations = (stations: Array<Station>, show: boolean, search: string) => {

        this.cluster.filter((entity) => entity.type !== this.MARKER_TYPE.STATION);
        console.log('before', this.cluster, 'show', show);

        if(!show || !stations.length) return;

        const points: Array<any> = [];
        for(let i = 0, list: Array<any> = this.entityFilter(stations, search); i < 3; i++) {
            const point: any = {...list[i].points.toGPS()};
            points.push({location: point});
        }

        // this.cluster.push({type: this.MARKER_TYPE.STATION, points})
        this.cluster.push({type: this.MARKER_TYPE.STATION, points});
    };

    private renderPoles = (poles: Array<Pole>, show: boolean, search: string) => {

        this.cluster.filter((entity) => entity.type !== this.MARKER_TYPE.POLE);

        if(!show || !poles.length) return;

        const points: Array<any> = [];
        for(let i = 0, list: Array<any> = this.entityFilter(poles, search); i < 3; i++) {
            const point: any = {...list[i].points.toGPS()};
            points.push({location: point});
        }

        // this.cluster.push({type: this.MARKER_TYPE.STATION, points})
        this.cluster.push({type: this.MARKER_TYPE.POLE, points});
    };

    private renderSegments = (segments: Array<Segment>, show: boolean, search: string) => {
        this.cluster.filter((entity) => entity.type !== this.MARKER_TYPE.SEGMENT);
        if(!show || !segments.length) return;

        const points: Array<any> = [];
        for(let i = 0, list: Array<any> = this.entityFilter(segments, search); i < list.length; i++) {
            points.push({location: list[i].pathList[0]});
        }
        this.cluster.push({type: this.MARKER_TYPE.SEGMENT, points})
    };

    // private renderStations = () => {
    //    const {stations, search} = this.props;
    //    const points: Array<any> = [];
    //
    //    for(let i = 0, list: Array<any> = this.entityFilter(stations, search); i < list.length; i++) {
    //        points.push(list[i]);
    //    }
    //
    //    this.cluster.push({type: this.MARKER_TYPE.STATION, points});
    // return points.map((point: Station) => (
    //    <MapView.Marker
    //        key={marker.id}
    //        coordinate={marker.points.toGPS()}
    //        image={require('../../../assets/images/station.png')}
    //    />
    // ));
    // };

    // private renderPoles = () => {
    //     const {poles, search} = this.props;
    //     const markers: Array<any> = [];
    //
    //     for(let i = 0, list: Array<any> = this.entityFilter(poles, search); i < list.length; i++) {
    //         markers.push(list[i]);
    //     }
    //
    //     return markers.map((marker: Station) => (
    //         <MapView.Marker
    //             key={marker.id}
    //             coordinate={marker.points.toGPS()}
    //             image={require('../../../assets/images/pole.png')}
    //         />
    //     ));
    // };

    // private renderSegments() {
    //     const {segments, search} = this.props;
    //     const markers: Array<any> = [];
    //     for(let i = 0, list: Array<any> = this.entityFilter(segments, search); i < list.length; i++) {
    //         markers.push(list[i]);
    //     }
    //
    //     let strokeColor = '#000';
    //     // markers.forEach((marker) => {
    //     //     strokeColor = marker.status === statuses[0].value ? 'blue' : (marker.status === statuses[1].value ? 'green' : 'red');
    //     // });
    //
    //     console.log('in render segments', markers[0].pathList);
    //
    //     return markers.map((marker: Segment) => (
    //         <Polyline
    //             key={marker.id}
    //             coordinates={marker.pathList}
    //             strokeWidth={2}
    //             strokeColor={strokeColor}
    //             // onPress={() => this.showDialog(marker)}
    //         />
    //     ));
    // }

    private renderCluster = (cluster, onPress) => {
        const pointCount = cluster.pointCount,
            coordinate = cluster.coordinate,
            clusterId = cluster.clusterId;

        // use pointCount to calculate cluster size scaling
        // and apply it to "style" prop below

        // eventually get clustered points by using
        // underlying SuperCluster instance
        // Methods ref: https://github.com/mapbox/supercluster
        const clusteringEngine = this.map.getClusteringEngine(),
            clusteredPoints = clusteringEngine.getLeaves(clusterId, 100);

        return (
            <Marker coordinate={coordinate} onPress={onPress}>
                <View style={localStyles.cluster}>
                    <Text>
                        {pointCount}
                    </Text>
                </View>
            </Marker>
        )
    };

    private renderMarker = (data) => {
        if(this.props.showStations) {
            return <Marker key={data.id || Math.random()} coordinate={data.location} image={require('../../../assets/images/station.png')}/>;
        }

        if(this.props.showPoles) {
            return <Marker key={data.id || Math.random()} coordinate={data.location} image={require('../../../assets/images/pole.png')}/>;
        }

        // if(this.props.showStations) {
        //
        // }
        // if(this.props.showSegments) {
        //     return <Polyline key={data.id || Math.random()} coordinates={data.location} strokeWidth={2} strokeColor={'#000'}/>
        // }
    };
    private renderPolyline = (data) => {
        return <Polyline key={data.id || Math.random()} coordinates={data.location} strokeWidth={2} strokeColor={'#000'}/>
    };

    // componentWillReceiveProps(nextProps: Readonly<IMapProps>, nextContext: any): void {
    //   //  if(nextProps.showStations) {
    //         this.renderStations();
    //   //  }
    // }
    //
    // private getPoints() {
    //     // for(let i = 0; i < this.props.stations.length; i++) {
    //     //
    //     //     const point: any = {...this.props.stations[i].points.toGPS()};
    //     //     this.points.push({location: point});
    //     // }
    //     const lines: any = [];
    //
    //     for(let i = 0; i < 3; i++) {
    //         const line: any = {...this.props.segments[i].pathList[0]};
    //       //  lines.push(line);
    //         this.points.push({location: this.props.segments[i].pathList[0]});
    //     }
    //
    //     //console.log('in get points', this.props.segments[0].pathList);
    //     console.log('in get points', lines);
    // };

    //
    // getDerivedStateFromProps() {
    //
    // }

    // componentDidUpdate(prevProps: Readonly<IMapProps>, prevState: Readonly<IMapState>, snapshot?: any): void {
    //     if(this.props.showStations !== prevProps.showStations) {
    //         this.renderStations();
    //     }
    // }

    render() {
        const {
            mapCenter, showStations
        } = this.props;

        //
        // console.log(this.cluster);
        //
        // console.log('point', this.cluster.slice(0, 3));
        // console.log('data', data);
        console.log(this.map);
        console.log('after', this.cluster);
        return (
            <ClusteredMapView style={{flex: 1}}
                              ref={ref => this.map = ref}
                              initialRegion={{
                                  ...mapCenter,
                                  latitudeDelta: 8.5,
                                  longitudeDelta: 8.5
                              }}
                              data={this.cluster.reduce((acc, entity) => [...acc, ...entity.points], [])}
                              renderMarker={this.renderMarker}
                              renderCluster={this.renderCluster}
                              clusteringEnabled={true}
            >
                {/*{*/}
                {/*    this.props.showSegments && (*/}
                {/*        this.renderSegments()*/}
                {/*    )*/}
                {/*}*/}
            </ClusteredMapView>

        )
    }
}

const localStyles = StyleSheet.create({
    cluster: {
        borderRadius: 100,
        borderWidth: 2,
        borderColor: "#f00",
        padding: 10,
    }
});

const mapStateToProps = (state: any) => ({
    mapCenter: state[moduleName].mapCenter,
    stations: locationStationsSelector(state),
    segments: locationSegmentsSelector(state),
    poles: locationPolesSelector(state),

    stationList: state[moduleName].stationList,

    showStations: state[moduleName].showStations,
    showSegments: state[moduleName].showSegments,
    showPoles: state[moduleName].showPoles,
});

const mapDispatchToProps = (dispatch: any) => (
    bindActionCreators({
        fetchCategories
    }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(MapScreen);