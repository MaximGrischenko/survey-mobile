import React, {Component} from 'react';
import {ClusterMap} from 'react-native-cluster-map';
import MapView, {PROVIDER_GOOGLE, Marker} from "react-native-maps";
import {View, StyleSheet, Platform, Image} from "react-native";
import {merge} from "immutable";

interface IMapProps {
    layout: any,
    zooming: boolean,
    initialized: boolean,
    shouldUpdate: boolean,
    showUserLocation: boolean,
    relocate: boolean,
    expandCluster: boolean,
    expanded: boolean,
    merged: boolean,
    options: any,
    region: any,
    location: any,
    cluster: any,
    onMapClick: Function,
    callback: Function,
}

interface IMapState {
    options: any,
    isMounted: boolean;
    layers: any;
    mapSnapshot: any;
}

class MapViewer extends Component<IMapProps, IMapState> {
    constructor(props: any) {
        super(props);

        this.state = {
            isMounted: true,
            layers: {
                expanded: {
                    isReady: false,
                },
                merged: {
                    isReady: false,
                }
            },
            options: {
                radius: 0,
                nodeSize: 25,
                maxZoom: 14,
                minZoom: 1
            },
            mapSnapshot: null,
        }
    }

    private map: any;
    private timeout: any;

    componentDidUpdate(prevProps: Readonly<IMapProps>, prevState: Readonly<IMapState>, snapshot?: any): void {
        if(this.state.layers.expanded.isReady && this.props.zooming) {
            const region = {...this.props.region, latitudeDelta: 0.006, longitudeDelta: 0.006};
            this.relocation(region, 500);
        }
        this.timeout = setTimeout(() => {
            this.props.callback({status: 'updated'})
        }, 2000);
    }

    componentWillReceiveProps(nextProps: Readonly<IMapProps>, nextContext: any): void {
        if(nextProps.relocate) {
            this.relocation(nextProps.region, 2000);
        }
        if(nextProps.expandCluster) {
            // console.log(this.map.viewer.mapRef);
            // const snapshot = this.map.viewer.mapRef.takeSnapshot({
            //     width: Dimensions.get('window').width,
            //     height: Dimensions.get('window').height,
            //     region: {...this.props.region},
            //     format: 'png',
            //     quality: 0.8,
            //     result: 'file'
            // });
            // snapshot.then((uri) => {
            //     this.setState({
            //         mapSnapshot: uri
            //     })
            // });

            this.relocation(nextProps.region, 500);

            setTimeout(() => {this.props.callback({status: 'expand'})}, 500);
        }
    }

    componentWillUnmount(): void {
        clearTimeout(this.timeout);
    }

    private expandCluster = (cluster) => {
        this.props.callback({cluster});
    };

    private mergeCluster = (zoom) => {
        if(!this.props.relocate && this.props.initialized && this.props.cluster.length) {
            if(zoom >= 8 && this.props.merged) {
                this.props.callback({status: 'expand'});
            }

            if(zoom <= 7 && this.props.expanded) {
                this.props.callback({status: 'merge'});
            }
        }
    };

    private relocation = (region, duration) => {
        this.map.mapRef.animateToRegion(region, duration);
    };

    private renderCluster = () => {
        return this.props.cluster.reduce((acc, entity) => [...acc, ...entity.markers], []);
    };

    render() {
        const {showUserLocation, region, location, layout} = this.props;
        return (
            <View style={{flex: 1, position: 'relative'}}>
                <View style={[localStyles.layer, this.state.layers.expanded.isReady ? localStyles.visible : localStyles.hidden]}>
                    {
                        this.props.expanded ? (
                            <ClusterMap
                                provider={PROVIDER_GOOGLE}
                                region={{...region}}
                                ref={ref => this.map = ref}
                                mapType={layout.charAt(0).toLowerCase() + layout.slice(1)}
                                // maxZoomLevel={this.state.options.maxZoom}
                                onMapReady={() => {
                                    this.setState({
                                        layers: {
                                            expanded: {
                                                isReady: true
                                            },
                                            merged: {
                                                isReady: false
                                            }
                                        },
                                    });
                                }}
                                onPress={(event) => this.props.onMapClick(event)}
                                superClusterOptions={{...this.state.options}}
                                priorityMarker={
                                    showUserLocation ? (
                                        <Marker
                                            key={Date.now()}
                                            coordinate={{...location}}
                                            image={Platform.OS === 'ios' ? require('../../../../assets/images/location.png') : require('../../../../assets/images/location-x4.png')}
                                        />
                                    ) : null
                                }
                                onZoomChange={(zoom) => this.mergeCluster(zoom)}
                            >
                                {
                                    this.props.cluster.length ? (
                                        this.renderCluster()
                                    ) : null
                                }
                            </ClusterMap>
                        ) : null
                    }
                </View>
                {
                    this.state.mapSnapshot ? (
                        <Image style={[localStyles.layer,localStyles.underlay]} source={{ uri: this.state.mapSnapshot.uri }} />
                    ) : null
                }
                <View style={[localStyles.layer, this.state.layers.merged.isReady ? localStyles.visible : localStyles.hidden]}>
                    {
                        this.props.merged ? (
                            <ClusterMap
                                provider={PROVIDER_GOOGLE}
                                region={{...region}}
                                ref={ref => this.map = ref}
                                // maxZoomLevel={this.state.options.maxZoom}
                                mapType={layout.charAt(0).toLowerCase() + layout.slice(1)}
                                onPress={(event) => {
                                   this.props.onMapClick(event)
                                }}
                                superClusterOptions={{...this.props.options}}
                                onMapReady={() => {
                                    this.setState({
                                        layers: {
                                            expanded: {
                                                isReady: false
                                            },
                                            merged: {
                                                isReady: true
                                            }
                                        },
                                    });
                                }}
                                priorityMarker={
                                    showUserLocation ? (
                                        <Marker
                                            key={Date.now()}
                                            coordinate={{...location}}
                                            image={Platform.OS === 'ios' ? require('../../../../assets/images/location.png') : require('../../../../assets/images/location-x4.png')}
                                        />
                                    ) : null
                                }
                                onZoomChange={(zoom) => this.mergeCluster(zoom)}
                                onClusterClick={(cluster) => this.expandCluster(cluster)}
                            >
                                {
                                    this.props.cluster.length ? (
                                        this.renderCluster()
                                    ) : null
                                }
                            </ClusterMap>
                        ) : null
                    }
                </View>
            </View>
        )
    }
}
const localStyles = StyleSheet.create({
    layer: {
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
    },
    hidden: {
        zIndex: -1,
        opacity: 0
    },
    visible: {
        zIndex: 5,
        opacity: 1
    },
    underlay: {
        zIndex: 2,
        opacity: 1,
    },
});

export default MapViewer;