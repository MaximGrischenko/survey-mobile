import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {FlatList, ScrollView, Text, StyleSheet, View, TouchableOpacity} from "react-native";
import {changeControls, locationSelector, powerlineSelector, powerlinesSelector} from "../../../../redux/modules/map";
import {fetchLocationParcels} from "../../../../redux/modules/map/parcels";
import {fetchLocationPoles} from "../../../../redux/modules/map/poles";
import {showDialogContent} from "../../../../redux/modules/dialogs";
import {fetchLocationSegments} from "../../../../redux/modules/map/segments";
import {Powerline, Project} from "../../../../entities";
import {COLORS} from "../../../../styles/colors";
import CheckBox from "../../../../components/checkbox";

interface IMapProps {
    changeControls: Function,
    fetchLocationParcels: Function,
    fetchLocationPoles: Function,
    fetchLocationSegments: Function,
    showDialogContent: Function,
    project: Project,
    powerlines: Array<Powerline>,
    selected_powerlines: Array<number>
}

class DrawerPowerlines extends Component<IMapProps> {

    state = {
        isAll: false
    };

    private selectItem = (item: any) => {
        let list: Array<number> = this.props.selected_powerlines.filter((el: any) => el.id === item.id);

        // if (!item) {
        //     list = this.state.isAll ? [] : [...this.props.powerlines.map(el => el.id)];
        //     this.props.changeControls({
        //         name: 'selected_powerlines',
        //         value: [...list]
        //     });
        //     this.setState({
        //         isAll: !this.state.isAll
        //     });
        //     return this.props.powerlines.forEach((el: any) => {
        //         this.loadItemData(el);
        //     });
        // }

        // for (let i = 0; i < list.length; i++) {
        //     if (list[i] === item.id) {
        //         list.splice(i, 1);
        //         this.props.changeControls({
        //             name: 'selected_powerlines',
        //             value: [...list]
        //         });
        //         return;
        //     }
        // }

        list.push(item.id);
        this.props.changeControls({
            name: 'selected_powerlines',
            value: [...list]
        });
      //  list.push(item.id);
        this.loadItemData(item);
    };

    private onChange = (name, item) => {
        this.props.changeControls({
            name,
            value: item.value
        });
        this.loadItemData(item);
    };

    private loadItemData = (item: any) => {
        const reqData = {...this.props.project, powerLineId: item.id};

        this.props.fetchLocationParcels(reqData);
        this.props.fetchLocationPoles(reqData);
        this.props.fetchLocationSegments(reqData);
    };

    private renderDivider = () => {
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

    render() {
        if (!this.props.project) {
            return null;
        }
        return (
            <View style={localStyles.container}>
                <Text style={localStyles.title}>Select Powerline:</Text>
                <ScrollView nestedScrollEnabled={true}>
                    <FlatList
                        ItemSeparatorComponent={this.renderDivider}
                        data={
                            [
                                // {
                                //     key: 'All',
                                //     title: 'All',
                                // },
                                ...this.props.powerlines
                            ]
                        }
                        renderItem={
                            ({item}: any) => {
                                // const selected = item.id ? (this.props.selected_powerlines.indexOf(item.id) > -1) : this.state.isAll;
                                // let styleItem = selected ? [localStyles.selected] : [localStyles.item];
                                // return (
                                //     <CheckBox
                                //         onPress={() => this.selectItem(item.id ? item : null)}
                                //         selected={selected}
                                //         text={<Text style={styleItem}>{item.title}</Text>}
                                //     />
                                // )
                                return (
                                    <TouchableOpacity key={item.value}
                                                      onPress={() => this.selectItem(item.id ? item : null)}>
                                        {
                                            (this.props.selected_powerlines.indexOf(item.id) > -1) ? (
                                                <View style={localStyles.radioBtn}>
                                                    <View style={localStyles.checkedCircle}>
                                                        <View style={localStyles.checkedInnerCircle}/>
                                                    </View>
                                                    <Text style={localStyles.selected}>{item.title}</Text>
                                                </View>
                                            ) : (
                                                <View style={localStyles.radioBtn}>
                                                    <View style={localStyles.circle} />
                                                    <Text style={localStyles.item}>{item.title}</Text>
                                                </View>
                                            )
                                        }
                                    </TouchableOpacity>
                                )
                            }
                        }
                    />
                </ScrollView>
            </View>
        )
    }
}

const localStyles = StyleSheet.create({
   container: {
       flex: 1,
       paddingTop: 30,
       paddingBottom: 30,
       width: '100%',
       maxHeight: 265,
       borderBottomWidth: 1,
       borderBottomColor: '#979797',
       borderBottomEndRadius: 1,
   },
    title: {
        paddingBottom: 20,
      //  opacity: 0.5,
        color: COLORS.TEXT_COLOR
    },
    scroll: {
        flex: 1,
        width: '100%',
    },

    radioBtn: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    circle: {
        width: 25,
        height: 25,
        borderRadius: 12.5,
        borderWidth: 1,
        borderColor: '#bcbcbc',
        marginRight: 10,
    },
    checkedCircle: {
        width: 25,
        height: 25,
        borderRadius: 12.5,
        backgroundColor: '#315581',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    checkedInnerCircle: {
        width: 11,
        height: 11,
        borderRadius: 5.5,
        backgroundColor: '#fff',
    },
    item: {
        padding: 10,
        fontSize: 16,
        height: 40,
        opacity: 0.7,
    },
    selected: {
        padding: 10,
        fontSize: 16,
        height: 40,
        opacity: 1,
    },
    // item: {
    //     padding: 10,
    //     fontSize: 16,
    //     height: 40,
    //     opacity: 0.7,
    // },
    // selected: {
    //     padding: 10,
    //     fontSize: 16,
    //     height: 40,
    //     opacity: 1,
    // },
});

const mapStateToProps = (state: any) => ({
   project: locationSelector(state),
   powerlines: powerlinesSelector(state),
   selected_powerlines: powerlineSelector(state),
});

const mapDispatchToProps = (dispatch: any) => (
    bindActionCreators({
        changeControls,
        fetchLocationParcels,
        fetchLocationPoles,
        fetchLocationSegments,
        showDialogContent,
    }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(DrawerPowerlines);