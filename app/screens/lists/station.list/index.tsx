import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {Parcel, Pole, Segment, Station} from "../../../entities";
import {
    FlatList,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableHighlight,
    TouchableOpacity,
    View
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import {CirclesLoader} from 'react-native-indicator';
import {COLORS} from "../../../styles/colors";
import {locationStationsSelector, moduleName} from "../../../redux/modules/map";
import {searchSelector} from "../../../redux/modules/auth";
import {showDialogContent} from "../../../redux/modules/dialogs";
import EditStationDialog from "../../map/dialogs/edit.station";


interface IMapProps {
    stations: Array<Station>,
    search: string,
    loading: boolean,
    showDialogContent: Function
}

class StationList extends Component<IMapProps> {

    private renderSeparator = () => {
        return (
            <View
                style={{
                    height: 1,
                    width: "100%",
                    backgroundColor: "#CED0CE",
                }}
            />
        );
    };

    private showDialog = (station) => {
        const {showDialogContent} = this.props;
        showDialogContent(
            {
                content: (
                    <EditStationDialog selectedItem={station} />
                ),
                header: (
                    <Text>Edit Stations ({station.id})</Text>
                )
            }
        );
    };

    render() {
        return (
            <View style={localStyles.wrapper}>
                {
                    !this.props.stations.length ? (
                        <Text style={localStyles.warning}>Please select some Project</Text>
                    ) : (
                        <View style={localStyles.wrapper}>
                            <ScrollView contentContainerStyle={localStyles.scroll}>
                                <FlatList
                                    nestedScrollEnabled={true}
                                    ItemSeparatorComponent={this.renderSeparator}
                                    data={this.props.stations}
                                    renderItem={({item, separators}) => {
                                        return (
                                            <View style={localStyles.row}>
                                                <Text style={localStyles.item}>{item['nazw_stac']}</Text>
                                                <TouchableOpacity onPress={() => this.showDialog(item)}>
                                                    <Icon name={Platform.OS === 'ios' ? 'ios-play' : 'md-play'} size={30} />
                                                </TouchableOpacity>
                                            </View>
                                        )
                                    }}
                                />
                            </ScrollView>
                        </View>
                    )
                }
            </View>
        )
    }
}

const localStyles = StyleSheet.create({
    wrapper: {
        flex: 1,
    },
    scroll: {
        flex: 1,
        width: '100%',
        marginTop: 90,
        paddingBottom: 30
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 40,
        paddingLeft: 10,
        paddingRight: 10,
    },
    item: {
        fontSize: 16,
        color: COLORS.TEXT_COLOR
    },
    warning: {
        fontSize: 20,
        color: COLORS.TEXT_COLOR,
        marginTop: 90
    }
});

const mapStateToProps = (state: any) => ({
    stations: locationStationsSelector(state),
    search: searchSelector(state),
    loading: state[moduleName].loading
});

const mapDispatchToProps = (dispatch: any) => (
    bindActionCreators({
        showDialogContent
    }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(StationList);