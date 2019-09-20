import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {View, ScrollView, TouchableOpacity, Dimensions, Platform, StyleSheet} from "react-native";
import Modal from 'react-native-modal';
import {PrimaryButton} from '../buttons/primary.button';
import Icon from 'react-native-vector-icons/Ionicons';

import {contentSelector, dialogSaveBtnSelector, showDialogContent} from "../../redux/modules/dialogs";
import {COLORS} from "../../styles/colors";
import {changeControls, moduleName} from "../../redux/modules/map";

interface IMapProps {
    showDialogContent: Function,
    changeControls: Function,
    allowAddPoi: any,
    dialogSaveBtn: any,
    content: any,
    alertText: any,
}

class DialogContainer extends Component<IMapProps> {
    static defaultProps: {
        dialogSaveBtn: null
    };

    private onClose = () => {
        if(this.props.allowAddPoi) {
            this.props.changeControls({
                name: 'allowAddPoi',
                value: false
            })
        }
       this.props.showDialogContent(false);
    };

    private renderHeader = () => {
        return (
            <View style={localStyles.header}>
                <View style={localStyles.title}>{this.props.content ? this.props.content.header : null}</View>
                <TouchableOpacity onPress={this.onClose}>
                    <Icon size={30} style={{paddingRight: 10}}
                          name={Platform.OS === 'ios' ? 'ios-close' : 'md-close'} />
                </TouchableOpacity>
            </View>
        )
    };

    private renderControls = (text, onPress) => {
        return (
            <View style={localStyles.controls}>
                {
                    this.props.dialogSaveBtn ? this.props.dialogSaveBtn : null
                }
                <PrimaryButton
                    style={{marginLeft: 15, marginRight: 15}}
                    title={text}
                    variant={"secondary"}
                    onPress={onPress}
                />
            </View>
        )
    };

    render() {
        const {content}: any = this.props;
        return (
            <Modal
                isVisible={!!content}
                animationIn={'zoomInDown'}
                animationOut={'zoomOutUp'}
                onBackdropPress={this.onClose}
                animationInTiming={250}
                animationOutTiming={250}
                backdropTransitionInTiming={250}
                backdropTransitionOutTiming={250}
                style={{
                    maxWidth: Dimensions.get('window').width*0.9,
                    maxHeight: Dimensions.get('window').height*0.9,
                    borderRadius: 5,
                    top: 30,
                    paddingTop: 10,
                    paddingBottom: 10,
                    backgroundColor: COLORS.BACKGROUND,
                }}
            >
                <View style={localStyles.container}>
                    {this.renderHeader()}
                    <View style={localStyles.container}>
                        {content ? content.content : null}
                    </View>
                    {this.renderControls('Cancel', this.onClose)}
                </View>
            </Modal>
        )
    }
}

const localStyles = StyleSheet.create({
    container: {
        flex: 1,
        borderRadius: 4,
    },
    header: {
        display: 'flex',
        flexDirection: 'row',
        paddingTop: 20,
        paddingBottom: 20,
    },
    title: {
        display: 'flex',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    controls: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        paddingTop: 10,
        paddingLeft: 20
    }
});

const mapStateToProps = (state: any) => ({
    content: contentSelector(state),
    allowAddPoi: state[moduleName].allowAddPoi,
    dialogSaveBtn: dialogSaveBtnSelector(state)
});

const mapDispatchToProps = (dispatch: any) => (
    bindActionCreators({
        changeControls,
        showDialogContent
    }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(DialogContainer);