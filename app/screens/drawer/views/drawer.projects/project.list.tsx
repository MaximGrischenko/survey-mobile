import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {Project} from '../../../../entities';
import {locationSelector, locationsSelector, moduleName} from "../../../../redux/modules/map";
import {fetchLocationStations} from "../../../../redux/modules/map/stations";
import {fetchLocationPoi} from "../../../../redux/modules/map/poi";
import {fetchProjectPowerlines} from "../../../../redux/modules/map/powerlines";
import {showDialogContent} from "../../../../redux/modules/dialogs";
import {fetchLocations, selectLocation} from "../../../../redux/modules/map/locations";
import {View, Text, FlatList, StyleSheet, TouchableHighlight, Platform, TextInput, ScrollView} from "react-native";
import {CirclesLoader} from 'react-native-indicator';
import Icon from 'react-native-vector-icons/Ionicons';
import {COLORS} from "../../../../styles/colors";

interface IMapProps {
    fetchLocationSegments: Function,
    fetchProjectPowerlines: Function,
    fetchLocationStations: Function,
    fetchLocationPoi: Function,
    showDialogContent: Function,
    selectLocation: Function,
    fetchLocations: Function,
    project: Project,
    loading: boolean,
    projects: Array<Project>
}

interface IMapState {
    search: string
}

class ProjectList extends Component<IMapProps, IMapState> {

    state = {
        search: ''
    };

    componentDidMount(): void {
        this.props.fetchLocations();
    }

    private selectProject = (project: any) => {
        this.props.selectLocation(project);
        this.props.showDialogContent(false);

        this.props.fetchLocationStations(project);
        this.props.fetchLocationPoi(project);
        this.props.fetchProjectPowerlines(project);
    };

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

    private onSearch = (value: string) => {
        this.setState({
            search: value
        })
    };

    render () {
        return (
            <View style={localStyles.wrapper}>
                {
                    this.props.loading ? (
                        <CirclesLoader />
                    ) : (
                        <View style={localStyles.wrapper}>
                            <View style={localStyles.search}>
                                <Icon name={Platform.OS === 'ios' ? 'ios-search' : 'md-search'} size={30} />
                                <TextInput
                                    style={localStyles.input}
                                    placeholder={'Search project...'}
                                    placeholderTextColor={COLORS.TEXT_COLOR}
                                    onChangeText={this.onSearch}
                                    value={this.state.search}
                                />
                            </View>
                            <ScrollView contentContainerStyle={localStyles.scroll}>
                                <FlatList
                                    nestedScrollEnabled={true}
                                    ItemSeparatorComponent={this.renderSeparator}
                                    data={this.props.projects.filter((el) => {
                                        if (this.state.search) {
                                            return el.title.toLowerCase().match(this.state.search.toLowerCase())
                                        } else {
                                            return true
                                        }
                                    })}
                                    renderItem={({item, separators}) => {
                                        let styleItem = [localStyles.item];
                                        if (this.props.project && item.id === this.props.project.id) {
                                            styleItem = [localStyles.selected];
                                        }
                                        return (
                                            <TouchableHighlight
                                                onPress={() => this.selectProject(item)}
                                                onShowUnderlay={separators.highlight}
                                                onHideUnderlay={separators.unhighlight}>
                                                <View style={{backgroundColor: 'white'}}>
                                                    <Text style={styleItem}>{item.title}</Text>
                                                </View>
                                            </TouchableHighlight>
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
    search: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'center',
        width: '70%',
        paddingBottom: 20,
        marginLeft: -30,
    },
    input: {
        width: '100%',
        height: 30,
        marginLeft: 5,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.PRIMARY,
        borderBottomEndRadius: 1,
    },
    scroll: {
        flex: 1,
        width: '100%',
    },
    item: {
        padding: 10,
        fontSize: 16,
        height: 40,
        opacity: 0.7,
        width: '100%',
    },
    selected: {
        padding: 10,
        fontSize: 16,
        height: 40,
        opacity: 1,
        width: '100%',
    },
});

const mapStateToProps = (state: any) => ({
    projects: locationsSelector(state),
    project: locationSelector(state),
    error: state[moduleName].error,
    loading: state[moduleName].loading
});

const mapDispatchToProps = (dispatch: any) => (
    bindActionCreators({
        fetchLocationStations,
        fetchLocationPoi,
        fetchProjectPowerlines,
        showDialogContent,
        selectLocation,
        fetchLocations,
    }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(ProjectList);