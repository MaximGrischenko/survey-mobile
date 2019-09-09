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
import {View, Text, FlatList, StyleSheet, TouchableHighlight} from "react-native";
import {CirclesLoader} from 'react-native-indicator';

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

class ProjectList extends Component<IMapProps> {
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

    render () {
        console.log(this.props.projects);
        return (
            <View style={localStyles.container}>
                {
                    this.props.loading ? (
                        <CirclesLoader />
                    ) : (
                        <FlatList
                                  nestedScrollEnabled={true}
                                  ItemSeparatorComponent={this.renderSeparator}
                                  data={this.props.projects}
                                  renderItem={({item, separators}) => {
                                      let styleItem = [localStyles.item];
                                      if (this.props.project && item.id === this.props.project.id) {
                                          styleItem = [localStyles.itemSelected];
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
                    )
                }
            </View>
        )
    }
}

const localStyles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    item: {
        padding: 10,
        fontSize: 16,
        height: 40,
        opacity: 0.7,
    },
    itemSelected: {
        padding: 10,
        fontSize: 16,
        height: 40,
        opacity: 1,
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