import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {Text, View, StyleSheet} from 'react-native';
import {PrimaryButton} from "../../../../components/buttons/primary.button";
import {Project} from '../../../../entities';
import {locationSelector} from "../../../../redux/modules/map";
import {showDialogContent} from "../../../../redux/modules/dialogs";

import ProjectList from './project.list';
import {COLORS} from "../../../../styles/colors";

interface IMapProps {
    project: Project,
    projects: Array<Project>,
    showDialogContent: Function
}

class DrawerProjects extends Component<IMapProps> {

    private onShowProjects = () => {
        this.props.showDialogContent({
            content: <ProjectList />,
            header: <Text>Select Project</Text>
        })
    };

    render() {
        const {project} = this.props;
        return (
            <View style={localStyles.container}>
                <View style={localStyles.titleContainer}>
                    <Text style={localStyles.filter}>Project: </Text>
                    {
                        project ? (
                            <Text>{project.title}</Text>
                        ) : null
                    }
                </View>
                <PrimaryButton
                    title={'Select Project'}
                    onPress={this.onShowProjects}
                />
            </View>
        )
    }
}

const localStyles = StyleSheet.create({
    container: {
        paddingTop: 30,
        paddingBottom: 30,
    },
    titleContainer: {
        paddingTop: 10,
        paddingBottom: 10,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    filter: {
        opacity: 0.5,
        color: COLORS.TEXT_COLOR
    },
    title: {
        opacity: 1,
        color: COLORS.TEXT_COLOR
    }
});

const mapStateToProps = (state: any) => ({
   project: locationSelector(state)
});

const mapDispatchToProps = (dispatch: any) => (
    bindActionCreators({
        showDialogContent
    }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(DrawerProjects);