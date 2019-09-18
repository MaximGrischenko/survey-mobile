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
import {locationSegmentsSelector, moduleName} from "../../../redux/modules/map";
import {searchSelector} from "../../../redux/modules/auth";
import {showDialogContent} from "../../../redux/modules/dialogs";
import EditSegmentDialog from '../../map/dialogs/edit.segment';


interface IMapProps {
    segments: Array<Station>,
    search: string,
    loading: boolean,
    showDialogContent: Function
}

class SegmentList extends Component<IMapProps> {

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

    private showDialog = (segment) => {
        const {showDialogContent} = this.props;
        showDialogContent(
            {
                content: (
                    <EditSegmentDialog selectedItem={segment} />
                ),
                header: (
                    <Text>Edit Segment ({segment.id})</Text>
                )
            }
        );
    };

    render() {
        return (
            <View style={localStyles.wrapper}>
                {
                    !this.props.segments.length ? (
                        <Text style={localStyles.warning}>Please select some Powerline</Text>
                    ) : (
                        <View style={localStyles.wrapper}>
                            <ScrollView contentContainerStyle={localStyles.scroll}>
                                <FlatList
                                    nestedScrollEnabled={true}
                                    ItemSeparatorComponent={this.renderSeparator}
                                    data={this.props.segments}
                                    renderItem={({item, separators}) => {
                                        return (
                                            <View style={localStyles.row}>
                                                <Text style={localStyles.item}>{item['przeslo']}</Text>
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
        marginTop: 70,
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
    segments: locationSegmentsSelector(state),
    search: searchSelector(state),
    loading: state[moduleName].loading
});

const mapDispatchToProps = (dispatch: any) => (
    bindActionCreators({
        showDialogContent
    }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(SegmentList);