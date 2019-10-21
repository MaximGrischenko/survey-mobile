import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as Location from "expo-location";
import * as Permissions from 'expo-permissions';
import {ClusterMap} from 'react-native-cluster-map';
import {Marker} from "react-native-maps";
import {applyGeoposition, moduleName} from "../../redux/modules/map";
import {showAlert} from "../../redux/modules/dialogs";
import {View, StyleSheet, Dimensions, TouchableOpacity, Platform, Text} from "react-native";
import {fetchCategories, fetchCategoriesOffline} from "../../redux/modules/admin/categories";
import {COLORS} from "../../styles/colors";
import {FabButton} from "../../components/buttons/fab.button";
import Icon from "react-native-vector-icons/Ionicons";
import {connectionSelector} from "../../redux/modules/connect";

interface IMapProps {
    connection: boolean,
    allowAddPoi: boolean,
    showUserLocation: boolean,
    region: any,
    location: any,
    cluster: any,
    fetchCategories: Function,
    fetchCategoriesOffline: Function,
    showAlert: Function,
    onAllowAddPoi: Function,
    onMapClick: Function,
}

interface IMapState {
    region: any,
    showUserLocation: boolean,
    location: any,
    options: any,
}

class MapScreen extends Component<IMapProps, IMapState> {
    private map: any;

    state = {
        location: this.props.location,
        options: {
            radius: 40,
            nodeSize: 25,
            maxZoom: 10,
            minZoom: 1
        },
        showUserLocation: this.props.showUserLocation,
        region: this.props.region,
    };

    async componentDidMount(){
        if(this.props.connection) {
            this.props.fetchCategories();
        } else {
            this.props.fetchCategoriesOffline();
        }
    }

    componentWillReceiveProps(nextProps: Readonly<IMapProps>, nextContext: any): void {
        if(nextProps.connection !== this.props.connection && nextProps.connection) {
            this.props.fetchCategories();
        } else if(nextProps.connection !== this.props.connection && !nextProps.connection) {
            this.props.fetchCategoriesOffline();
        }
    }


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

    private renderCluster = () => {
        return this.props.cluster.reduce((acc, entity) => [...acc, ...entity.markers], []);
    };

    render() {
        const {showUserLocation, options, region} = this.state;
        return (
            <View style={{flex: 1}}>
                {
                    this.state.region ? (
                        <View style={{flex: 1}}>
                            <ClusterMap
                                region={{...region}}
                                ref={ref => this.map = ref}
                                onPress={(event) => this.props.onMapClick(event)}
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
                                onZoomChange={(zoom) => {
                                    console.log('ZOOM', zoom);
                                    // if(zoom >= 10) {
                                    //     this.setState({
                                    //         options: {...this.state.options, radius: 0.005}
                                    //     })
                                    // } else {
                                    //     this.setState({
                                    //         options: {...this.state.options, radius: 40}
                                    //     })
                                    // }
                                }}
                                onClusterClick={() => {
                                    console.log('CLICKED');
                                }}
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
                    <TouchableOpacity style={localStyles.location} onPress={this.getLocationAsync}>
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
    allowAddPoi: state[moduleName].allowAddPoi,
    connection: connectionSelector(state),
});

const mapDispatchToProps = (dispatch: any) => (
    bindActionCreators({
        showAlert,
        fetchCategories,
        fetchCategoriesOffline,
    }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(MapScreen);