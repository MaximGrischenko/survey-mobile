import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

// import MapView from 'react-native-map-clustering';
import {Callout, Marker, Polygon, Polyline} from 'react-native-maps';
import {View, Text, StyleSheet, ScrollView} from "react-native";
import {fetchCategories} from "../../redux/modules/admin/categories";
import {Geometry, GPSCoordinate, Parcel, Poi, Pole, Project, Segment, Station} from "../../entities";
import {locationSegmentsSelector, locationStationsSelector, moduleName} from "../../redux/modules/map";

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
}

interface IMapState {
    allowAddPoi: boolean
}

class MapScreen extends Component<IMapProps, IMapState> {

    state = {
        allowAddPoi: false,
    };

    private map: any;
    private points: any = [];

    private cluster: any = [
        {
            type: "1",
            points: [
                {
                    location: {
                        latitude: '1',
                        longitude: '1',
                    },
                },
                {
                    location: {
                        latitude: '11',
                        longitude: '11',
                    },
                }
            ],
        },
        {
            type: "2",
            points: [
                {
                    location: {
                        latitude: '2',
                        longitude: '2',
                    },
                }
            ],
        },
        {
            type: "3",
            points: [
                {
                    location: {
                        latitude: '3',
                        longitude: '3',
                    },
                }
            ],
        }
    ];

        // [
        //     {
        //         location: {
        //             latitude: '2',
        //             longitude: '2',
        //         },
        //     },
        //     {
        //         location: {
        //             latitude: '3',
        //             longitude: '3',
        //         },
        //     }
        // ]

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

    private renderSt = () => {
        const {stations, search, showStations} = this.props;
        const points: Array<any> = [];

        if(!showStations || !stations.length) {
            this.cluster.filter((t) => t.type !== 1);
        } else {
            this.cluster.type = '1';
           // this.cluster.type['1'].push()
        }
    };

    private renderStations = () => {
       const {stations, search} = this.props;
       const markers: Array<any> = [];

       for(let i = 0, list: Array<any> = this.entityFilter(stations, search); i < list.length; i++) {
           markers.push(list[i]);
       }

       return markers.map((marker: Station) => (
          <MapView.Marker
              key={marker.id}
              coordinate={marker.points.toGPS()}
              image={require('../../../assets/images/station.png')}
          />
       ));
    };

    private renderPoles = () => {
        const {poles, search} = this.props;
        const markers: Array<any> = [];

        for(let i = 0, list: Array<any> = this.entityFilter(poles, search); i < list.length; i++) {
            markers.push(list[i]);
        }

        return markers.map((marker: Station) => (
            <MapView.Marker
                key={marker.id}
                coordinate={marker.points.toGPS()}
                image={require('../../../assets/images/pole.png')}
            />
        ));
    };

    private renderSegments() {
        const {segments, search} = this.props;
        const markers: Array<any> = [];
        for(let i = 0, list: Array<any> = this.entityFilter(segments, search); i < list.length; i++) {
            markers.push(list[i]);
        }

        let strokeColor = '#000';
        // markers.forEach((marker) => {
        //     strokeColor = marker.status === statuses[0].value ? 'blue' : (marker.status === statuses[1].value ? 'green' : 'red');
        // });

        console.log('in render segments', markers[0].pathList);

        return markers.map((marker: Segment) => (
            <Polyline
                key={marker.id}
                coordinates={marker.pathList}
                strokeWidth={2}
                strokeColor={strokeColor}
                // onPress={() => this.showDialog(marker)}
            />
        ));
    }

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
        console.log('in data', data.location);
        return <Marker key={data.id || Math.random()} coordinate={data.location} />;
    };
    private renderPolyline = (data) => {
        console.log('in data', data.location);
        return <Polyline key={data.id || Math.random()} coordinates={data.location} strokeWidth={2} strokeColor={'#000'}/>
    };

    componentWillReceiveProps(nextProps: Readonly<IMapProps>, nextContext: any): void {
      //  if(nextProps.showStations) {
            this.renderSt();
      //  }
    }

    private getPoints() {
        // for(let i = 0; i < this.props.stations.length; i++) {
        //
        //     const point: any = {...this.props.stations[i].points.toGPS()};
        //     this.points.push({location: point});
        // }
        const lines: any = [];

        for(let i = 0; i < 3; i++) {
            const line: any = {...this.props.segments[i].pathList[0]};
          //  lines.push(line);
            this.points.push({location: this.props.segments[i].pathList[0]});
        }

        //console.log('in get points', this.props.segments[0].pathList);
        console.log('in get points', lines);
    };

    componentDidMount(): void {
        this.props.fetchCategories();
    }

    render() {
        const {
            mapCenter, showStations
        } = this.props;
         const data = [
             {
                 location: {
                     latitude: 49.6869251413378,
                     longitude: 21.1709195813684
                 }
             },
             {
                 location: {
                     latitude: 49.6869551413378,
                     longitude: 21.1709395813684
                 }
             },
         ];

         console.log(this.cluster);

         console.log('point', this.points.slice(0, 3));
        // console.log('data', data);

        return (
            <ClusteredMapView style={{flex: 1}}
                              ref={ref => this.map = ref}
                              initialRegion={{
                                  ...mapCenter,
                                  latitudeDelta: 8.5,
                                  longitudeDelta: 8.5
                              }}
                              // TODO SLICE
                              data={this.cluster.reduce((acc, item) => [...acc, ...item.points], [])}
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

    showStations: state[moduleName].showStations,
    showSegments: state[moduleName].showSegments,
});

const mapDispatchToProps = (dispatch: any) => (
    bindActionCreators({
        fetchCategories
    }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(MapScreen);