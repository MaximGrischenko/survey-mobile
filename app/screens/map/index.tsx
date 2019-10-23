import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {ClusterMap} from 'react-native-cluster-map';
import {Marker} from "react-native-maps";
import {View, StyleSheet, Dimensions, TouchableOpacity, Platform, Text} from "react-native";
import {COLORS} from "../../styles/colors";
import {FabButton} from "../../components/buttons/fab.button";
import Icon from "react-native-vector-icons/Ionicons";

interface IMapProps {
    allowAddPoi: boolean,
    showUserLocation: boolean,
    moveToLocation: boolean,
    // forceUpdate: boolean,
    expandCluster: boolean,
    isMount: boolean,
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


    shouldUpdate: boolean,
}

interface IMapState {
    // region: any,
    // showUserLocation: boolean,
    // location: any,
    // options: any,
   // cluster: any,
    isMounted: boolean;
}

class MapScreen extends Component<IMapProps, IMapState> {
    private map: any;
    private timeout: any;
    state = {
       // cluster: this.props.cluster,
       //  options: this.props.options,
        isMounted: true,
        // region: this.props.region
    };


    // shouldComponentUpdate(nextProps: Readonly<IMapProps>, nextState: Readonly<IMapState>, nextContext: any): boolean {
    //     // if(nextProps.allowAddPoi !== this.props.allowAddPoi) {
    //     //     return true
    //     // } else if(nextProps.forceUpdate) {
    //     // console.log('FORCE UPDATE', nextProps.forceUpdate);
    //    // return nextProps.shouldUpdate;
    //     // } else {
    //     //     return false;
    //     // }
    //     return true;
    // }

    componentDidUpdate(prevProps: Readonly<IMapProps>, prevState: Readonly<IMapState>, snapshot?: any): void {
        this.timeout = setTimeout(() => {
            this.props.callback({status: 'updated'})
        }, 1500);
    }

    componentWillReceiveProps(nextProps: Readonly<IMapProps>, nextContext: any): void {
        console.log('Next PROPS', nextProps.shouldUpdate);


       // if(!nextProps.isMount) {
       //     this.setState({
       //         isMounted: false,
       //     });
       //
       //     this.timeout = setTimeout(() => {this.setState({
       //         isMounted: true
       //     })}, 0);
       //
       //     this.props.callback({status: 'mounted'})
       // }



       if(nextProps.moveToLocation) {
           console.log('IN MOVE TO LOCATION');

           console.log('nextProps LOCA', nextProps.location);

           this.moveToLocation(nextProps.location, 2000);
       }

       // console.log('nextProps.forceRender', nextProps.options, nextProps.forceUpdate, nextProps.expandCluster);

        if(nextProps.expandCluster) {
            console.log('THERE');
            // this.setState({
            //     // cluster: nextProps.cluster,
            //     options: nextProps.options
            // });
            // this.reload();
           this.moveToLocation(nextProps.region, 2000);
        }

        // this.forceUpdate();
    }

    // private reload = () => {
    //     this.forceUpdate();
    // };

    componentWillUnmount(): void {
        clearTimeout(this.timeout);
    }

    private handleClusterClick = (cluster) => {
        this.setState({
            isMounted: false,
        });

        this.timeout = setTimeout(() => {this.setState({
            isMounted: true
        })}, 0);

        this.props.onClusterClick(cluster);
    };

    private moveToLocation = (region, duration) => {
        console.log('REGION', region);



        try {
            this.map.mapRef.animateToRegion(region, duration);
        } catch (e) {
            console.log('EEEEEE', e);
        }
    };

    private renderCluster = () => {
        return this.props.cluster.reduce((acc, entity) => [...acc, ...entity.markers], []);
    };

    render() {
        const {showUserLocation, region, location, options} = this.props;
        // const {region} = this.state;
        // console.log('OPTIONS', this.state.options);
        // console.log('OOOOOO', this.props.options);
        return (
            <View style={{flex: 1}}>
                {
                    this.props.region && this.state.isMounted ? (
                        <View style={{flex: 1}}>
                            <ClusterMap
                                region={{...region}}
                                ref={ref => this.map = ref}
                                onPress={(event) => this.props.onMapClick(event)}
                                superClusterOptions={{...options}}
                                priorityMarker={
                                    showUserLocation ? (
                                        <Marker
                                            key={Date.now()}
                                            coordinate={{...location}}
                                            image={Platform.OS === 'ios' ? require('../../../assets/images/location.png') : require('../../../assets/images/location-x4.png')}
                                        />
                                    ) : null
                                }
                                onZoomChange={(zoom) => this.props.onZoomChange(zoom)}
                                onClusterClick={(cluster) => this.handleClusterClick(cluster)}
                            >
                                {
                                    this.props.cluster.length ? (
                                        this.renderCluster()
                                    ) : null
                                }
                            </ClusterMap>
                        </View>
                    ) : null
                }
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