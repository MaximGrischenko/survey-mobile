import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import MapView from 'react-native-maps';
import {Marker} from 'react-native-maps';
import {View} from "react-native";

class MapScreen extends Component {
    private map: any;

    render() {
        return (
            <View style={{flex: 1}}>
                <MapView
                    style={{flex: 1}}
                    ref={ref => this.map = ref}
                    region={{
                        latitude: 52.5,
                        longitude: 19.2,
                        latitudeDelta: 8.5,
                        longitudeDelta: 8.5
                    }}
                />
            </View>
        )
    }
}

const mapStateToProps = (state: any) => ({

});

const mapDispatchToProps = (dispatch: any) => (
    bindActionCreators({

    }, dispatch)
);

export default connect(mapDispatchToProps, mapStateToProps)(MapScreen);