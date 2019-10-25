import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {ClusterMap} from 'react-native-cluster-map';
import MapView, {PROVIDER_GOOGLE, Marker} from "react-native-maps";
import {View, StyleSheet, Dimensions, TouchableOpacity, Platform, Text, Image} from "react-native";
import {COLORS} from "../../styles/colors";
import {FabButton} from "../../components/buttons/fab.button";
import Icon from "react-native-vector-icons/Ionicons";
import {merge} from "immutable";

interface IMapProps {
    allowAddPoi: boolean,
    showUserLocation: boolean,
    relocate: boolean,
    // forceUpdate: boolean,
    expandCluster: boolean,
    expanded: boolean,

    merged: boolean,
    // forceRender: boolean,
    options: any,
    region: any,
    location: any,
    cluster: any,
    // fetchCategories: Function,
    // fetchCategoriesOffline: Function,
    // showAlert: Function,
    onAllowAddPoi: Function,
    onMapClick: Function,
    onClusterClick: Function,
    onZoomChange: Function,
    onGetLocation: Function,
    callback: Function,


    initialized: boolean,

    shouldUpdate: boolean,
}

interface IMapState {
    // region: any,
    // showUserLocation: boolean,
    // location: any,
    options: any,
   // cluster: any,
    isMounted: boolean;
    layers: any;
    mapSnapshot: any;
}

// interface ILayerProps {
//     cb: Function,
//     onMapClick: Function,
//     region: any,
//     location: any,
//     cluster: any,
//     showUserLocation: boolean,
// }
//
// interface ILayerState {
//     options: any,
// }
//
// class Layer extends Component<ILayerProps, ILayerState> {
//     private map;
//     private isReady;
//
//     state = {
//         options: {
//             radius: 0,
//             nodeSize: 25,
//             maxZoom: 10,
//             minZoom: 1
//         }
//     };
//
//     render() {
//         const {region, location, showUserLocation} = this.props;
//         return (
//             <View style={{flex: 1}} ref={(node) => this.props.cb(node)}>
//                 <ClusterMap
//                     // onRegionChangeComplete={(region) => console.log('REGION WHEN COMPLETE', region)}
//                     provider={PROVIDER_GOOGLE}
//                     region={{...region}}
//                     ref={ref => this.map = ref}
//                     onMapReady={() => {console.log('ready')}}
//                     onPress={(event) => this.props.onMapClick(event)}
//                     superClusterOptions={{...this.state.options}}
//                     priorityMarker={
//                         showUserLocation ? (
//                             <Marker
//                                 key={Date.now()}
//                                 coordinate={{...location}}
//                                 image={Platform.OS === 'ios' ? require('../../../assets/images/location.png') : require('../../../assets/images/location-x4.png')}
//                             />
//                         ) : null
//                     }
//                     onZoomChange={(zoom) => this.mergeCluster(zoom)}
//                     // onClusterClick={(cluster) => this.expandCluster(cluster)}
//                 >
//                     {
//                         this.props.cluster.length ? (
//                             this.renderCluster()
//                         ) : null
//                     }
//                 </ClusterMap>;
//             </View>
//         )
//     }
// }

class MapScreen extends Component<IMapProps, IMapState> {
    constructor(props: any) {
        super(props);

        // this.setState({
        //     // isMounted: true,
        //     region: props.region
        // });

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
                maxZoom: 10,
                minZoom: 1
            },
            mapSnapshot: null,
        }

        // this.isReady = true;
    }

    private map: any;
    private timeout: any;
    private isReady: boolean;

    // state = {
    //    // cluster: this.props.cluster,
    //    //  options: this.props.options,
    //     isMounted: true,
    //     // region: this.props.region
    // };


    // shouldComponentUpdate(nextProps: Readonly<IMapProps>, nextState: Readonly<IMapState>, nextContext: any): boolean {
    //     // if(nextProps.allowAddPoi !== this.props.allowAddPoi) {
    //     //     return true
    //     // } else if(nextProps.forceUpdate) {
    //     // console.log('FORCE UPDATE', nextProps.forceUpdate);
    //    return nextProps.shouldUpdate;
    //     // } else {
    //     //     return false;
    //     // }
    //     // return true;
    // }

    componentDidMount(): void {

    }

    componentDidUpdate(prevProps: Readonly<IMapProps>, prevState: Readonly<IMapState>, snapshot?: any): void {
        // console.log('before callback');
        //
        this.timeout = setTimeout(() => {
            this.props.callback({status: 'updated'})
        }, 2000);
    }

    componentWillReceiveProps(nextProps: Readonly<IMapProps>, nextContext: any): void {
        if(nextProps.relocate) {
           this.relocation(nextProps.region, 2000);
        }
        if(nextProps.expandCluster) {
            console.log(this.map.mapRef);
            // const snapshot = this.map.mapRef.takeSnapshot({
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

            setTimeout(() => {this.props.callback({status: 'expand'})}, 1000);
        }
    }

    componentWillUnmount(): void {
        clearTimeout(this.timeout);
    }

    private expandCluster = (cluster) => {
        this.props.callback({cluster});
    };

    private mergeCluster = (zoom) => {
        console.log('Expanded', this.props.expanded);
        console.log('ExpandCluster', this.props.expandCluster);
        console.log('Relocate', this.props.relocate);
        console.log('Merged', this.props.merged);
        console.log('CurrentZoom', zoom);



        if(!this.props.relocate && this.props.initialized) {
            if(zoom >= 8 && this.props.merged) {
                this.props.callback({status: 'expand'});
            }

            if(zoom <= 7 && this.props.expanded) {
                this.props.callback({status: 'merge'});
            }
        }

        // switch (zoom) {
        //     case 6: {
        //         console.log('case: 6');
        //     }
        //     case 7: {
        //         console.log('case: 7');
        //
        //         if(this.props.expanded) {
        //             this.props.callback({status: 'merge'});
        //         }
        //
        //         // if(this.props.merged) {
        //         //     this.props.callback({status: 'expand'});
        //         // }
        //     } break;
        //     case 8: {
        //         console.log('case: 8');
        //
        //         if(this.props.merged) {
        //             this.props.callback({status: 'expand'});
        //         }
        //     } break;
        // }



        // if(zoom < 8 && this.props.expanded) {
        //     console.log('IN IF');
        //     this.props.callback({status: 'merge'});
        // } else {
        //     console.log('IN ELSE IF');
        //     this.props.callback({status: 'expand'});
        // }

        // else if(zoom > 6 && this.props.merged) {
        //     this.props.callback({status: 'expand'});
        // }
    };

    private relocation = (region, duration) => {
        this.map.mapRef.animateToRegion(region, duration);
    };

    private renderCluster = () => {
        return this.props.cluster.reduce((acc, entity) => [...acc, ...entity.markers], []);
    };

    render() {
        const {showUserLocation, region, location} = this.props;
        return (
            <View style={{flex: 1, position: 'relative'}}>
                <View style={[localStyles.layer, this.state.layers.expanded.isReady ? localStyles.visible : localStyles.hidden]}>
                    {
                        this.props.expanded ? (
                            <ClusterMap
                                provider={PROVIDER_GOOGLE}
                                region={{...region}}
                                ref={ref => this.map = ref}
                                onMapReady={() => {
                                    setTimeout(() => {
                                        this.setState({
                                            layers: {
                                                expanded: {
                                                    isReady: true
                                                },
                                                merged: {
                                                    isReady: false
                                                }
                                            },
                                        })
                                    }, 10)
                                }}

                                onPress={(event) => this.props.onMapClick(event)}
                                superClusterOptions={{...this.state.options}}
                                priorityMarker={
                                    showUserLocation ? (
                                        <Marker
                                            key={Date.now()}
                                            coordinate={{...location}}
                                            image={Platform.OS === 'ios' ? require('../../../assets/images/location.png') : require('../../../assets/images/location-x4.png')}
                                        />
                                    ) : null
                                }
                                onZoomChange={(zoom) => this.mergeCluster(zoom)}
                                // onClusterClick={(cluster) => this.expandCluster(cluster)}
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
                                onPress={(event) => this.props.onMapClick(event)}
                                superClusterOptions={{...this.props.options}}
                                onMapReady={() => {
                                    setTimeout(() => {
                                        this.setState({
                                            layers: {
                                                expanded: {
                                                    isReady: false
                                                },
                                                merged: {
                                                    isReady: true
                                                }
                                            },
                                        })
                                    }, 10)
                                }}
                                priorityMarker={
                                    showUserLocation ? (
                                        <Marker
                                            key={Date.now()}
                                            coordinate={{...location}}
                                            image={Platform.OS === 'ios' ? require('../../../assets/images/location.png') : require('../../../assets/images/location-x4.png')}
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


                {/*{*/}
                {/*    this.props.expanded ? (*/}
                {/*        <View style={{flex: 1}}>*/}
                {/*            <ClusterMap*/}
                {/*                // onRegionChangeComplete={(region) => console.log('REGION WHEN COMPLETE', region)}*/}
                {/*                provider={PROVIDER_GOOGLE}*/}
                {/*                region={{...region}}*/}
                {/*                ref={ref => this.map = ref}*/}
                {/*                onMapReady={() => console.log('EXPANDED READY')}*/}
                {/*                onPress={(event) => this.props.onMapClick(event)}*/}
                {/*                superClusterOptions={{...this.state.options}}*/}
                {/*                priorityMarker={*/}
                {/*                    showUserLocation ? (*/}
                {/*                        <Marker*/}
                {/*                            key={Date.now()}*/}
                {/*                            coordinate={{...location}}*/}
                {/*                            image={Platform.OS === 'ios' ? require('../../../assets/images/location.png') : require('../../../assets/images/location-x4.png')}*/}
                {/*                        />*/}
                {/*                    ) : null*/}
                {/*                }*/}
                {/*                onZoomChange={(zoom) => this.mergeCluster(zoom)}*/}
                {/*                // onClusterClick={(cluster) => this.expandCluster(cluster)}*/}
                {/*            >*/}
                {/*                {*/}
                {/*                    this.props.cluster.length ? (*/}
                {/*                        this.renderCluster()*/}
                {/*                    ) : null*/}
                {/*                }*/}
                {/*            </ClusterMap>*/}
                {/*        </View>*/}
                {/*    ) : (*/}
                {/*        <React.Fragment>*/}
                {/*            <ClusterMap*/}
                {/*                // onRegionChangeComplete={(region) => console.log('REGION WHEN COMPLETE', region)}*/}
                {/*                provider={PROVIDER_GOOGLE}*/}
                {/*                region={{...region}}*/}
                {/*                ref={ref => this.map = ref}*/}
                {/*                onPress={(event) => this.props.onMapClick(event)}*/}
                {/*                superClusterOptions={{...this.props.options}}*/}
                {/*                onMapReady={() => console.log('MERGED READY')}*/}
                {/*                priorityMarker={*/}
                {/*                    showUserLocation ? (*/}
                {/*                        <Marker*/}
                {/*                            key={Date.now()}*/}
                {/*                            coordinate={{...location}}*/}
                {/*                            image={Platform.OS === 'ios' ? require('../../../assets/images/location.png') : require('../../../assets/images/location-x4.png')}*/}
                {/*                        />*/}
                {/*                    ) : null*/}
                {/*                }*/}
                {/*                onZoomChange={(zoom) => this.mergeCluster(zoom)}*/}
                {/*                onClusterClick={(cluster) => this.expandCluster(cluster)}*/}
                {/*            >*/}
                {/*                {*/}
                {/*                    this.props.cluster.length ? (*/}
                {/*                        this.renderCluster()*/}
                {/*                    ) : null*/}
                {/*                }*/}
                {/*            </ClusterMap>*/}
                {/*        </React.Fragment>*/}
                {/*    )*/}
                {/*}*/}
                <React.Fragment>
                    <TouchableOpacity style={localStyles.location} onPress={() => this.props.onGetLocation()}>
                        <Icon name={Platform.OS === 'ios' ? 'ios-locate' : 'md-locate'} size={24} color={COLORS.SECONDARY} style={localStyles.icon}/>
                    </TouchableOpacity>
                    <FabButton
                        style={localStyles.button}
                        onPress={this.props.onAllowAddPoi}
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
        zIndex: 10,
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
    button: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        zIndex: 10
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
    // allowAddPoi: state[moduleName].allowAddPoi,
    // connection: connectionSelector(state),
});

const mapDispatchToProps = (dispatch: any) => (
    bindActionCreators({
        // showAlert,
        // fetchCategories,
        // fetchCategoriesOffline,
    }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(MapScreen);