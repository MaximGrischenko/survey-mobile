import React, {Component} from 'react';
import {View, Text, StyleSheet, ScrollView, FlatList, TouchableOpacity, Platform} from "react-native";
import {Parcel, Poi, Pole, Segment, Station} from "../../../entities";

import EditStationDialog from '../../../components/dialog.component/dialogs/edit.station';
import EditParcelDialog from '../../../components/dialog.component/dialogs/edit.parcel';
import EditSegmentDialog from '../../../components/dialog.component/dialogs/edit.segment';
import EditPoleDialog from '../../../components/dialog.component/dialogs/edit.pole';
import EditPoiDialog from '../../../components/dialog.component/dialogs/edit.poi';
import {COLORS} from "../../../styles/colors";
import Icon from "react-native-vector-icons/Ionicons";

interface IMapProps {
    showDialogContent: Function,
    search: string,
    selectedList: Array<any>,
}

export const TYPES = {
    NONE: -1,
    PARCEL: 1,
    POLE: 2,
    STATION: 3,
    SEGMENT: 4,
    POI: 5,
};

export default class MainList extends Component<IMapProps> {
    protected type: number = TYPES.NONE;
    protected title: string = '';
    private renderSeparator = () => {
        return (
            <View
                style={{
                    height: 1,
                    width: '100%',
                    backgroundColor: '#ced0ce',
                }}
            />
        )
    };

    private showDialog = (entity) => {
        const {showDialogContent} = this.props;

        if(entity instanceof Station) {
            showDialogContent(
                {
                    content: (
                        <EditStationDialog selectedItem={entity} />
                    ),
                    header: (
                        <Text>Edit Stations ({entity.id})</Text>
                    )
                }
            )
        } else if(entity instanceof Parcel) {
            showDialogContent(
                {
                    content: (
                        <EditParcelDialog selectedItem={entity} />
                    ),
                    header: (
                        <Text>Edit Parcel ({entity.id})</Text>
                    )
                }
            )
        } else if(entity instanceof Pole) {
            showDialogContent(
                {
                    content: (
                        <EditPoleDialog selectedItem={entity}/>
                    ),
                    header: (
                        <Text>Edit Pole ({entity.id})</Text>
                    )
                }
            )
        } else if(entity instanceof Segment) {
            showDialogContent(
                {
                    content: (
                        <EditSegmentDialog selectedItem={entity}/>
                    ),
                    header: (
                        <Text>Edit Segment ({entity.id})</Text>
                    )
                }
            )
        } else if(entity instanceof Poi) {
            showDialogContent(
                {
                    content: (
                        <EditPoiDialog selectedItem={entity}/>
                    ),
                    header: (
                        <Text>Edit Poi ({entity.id})</Text>
                    )
                }
            )
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

    private getRows = () => {
        const rows: Array<any> = [];

        if(this.type === TYPES.STATION) {
            const keys: {key_title: string; key_subtitle: string} = {key_title: 'nazw_stac', key_subtitle: ''};
            rows.push(keys)
        } else if(this.type === TYPES.PARCEL) {
            const keys: {key_title: string; key_subtitle: string} = {key_title: 'numer', key_subtitle: ''};
            rows.push(keys);
        } else if(this.type === TYPES.SEGMENT) {
            const keys: {key_title: string; key_subtitle: string} = {key_title: 'przeslo', key_subtitle: ''};
            rows.push(keys);
        } else if(this.type === TYPES.POLE) {
            const keys: {key_title: string; key_subtitle: string} = {key_title: 'num_slup', key_subtitle: ''};
            rows.push(keys);
        } else if(this.type === TYPES.POI) {
            const keys: {key_title: string; key_subtitle: string} = {key_title: 'title', key_subtitle: ''};
            rows.push(keys);
        }

        return rows;
    };

    protected _render() {
        const {selectedList}: any = this.props;
        const rows = this.getRows()
        ;
        return(
            <View style={localStyles.wrapper}>
                {
                    !selectedList.length ? (
                        <Text style={localStyles.warning}>Please select some Project</Text>
                    ) : (
                        <View style={localStyles.wrapper}>
                            <ScrollView contentContainerStyle={localStyles.scroll}>
                                <FlatList
                                    nestedScrollEnabled={true}
                                    ItemSeparatorComponent={this.renderSeparator}
                                    data={MainList.entityFilter(selectedList, this.props.search)}
                                    renderItem={({item, separators}) => {
                                        return (
                                            <TouchableOpacity style={localStyles.row} onPress={() => this.showDialog(item)}>
                                                <Text style={localStyles.item}>{item[rows.reduce((acc, keys) => `${acc}${keys.key_title}`, '')]}</Text>
                                                <Icon name={Platform.OS === 'ios' ? 'ios-play' : 'md-play'} size={30} />
                                            </TouchableOpacity>
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
        marginTop: 80,
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
