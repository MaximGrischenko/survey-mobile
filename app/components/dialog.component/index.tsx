import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {View, TouchableOpacity, Dimensions, Platform, StyleSheet} from "react-native";
import Modal from 'react-native-modal';
import {PrimaryButton} from '../buttons/primary.button';
import Icon from 'react-native-vector-icons/Ionicons';

import {
    contentSelector,
    dialogDeleteBtnSelector,
    dialogSaveBtnSelector, dialogShowBtnSelector,
    showDialogContent
} from "../../redux/modules/dialogs";
import {COLORS} from "../../styles/colors";
import {changeControls, moduleName} from "../../redux/modules/map";

interface IMapProps {
    showDialogContent: Function,
    changeControls: Function,
    allowAddPoi: any,
    dialogSaveBtn: any,
    dialogDeleteBtn: any,
    dialogShowBtn: any,
    content: any,
    alertText: any,
}

class DialogContainer extends Component<IMapProps> {
    static defaultProps: {
        dialogSaveBtn: null,
        dialogDeleteBtn: null,
        dialogShowBtn: null,
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
                {
                    this.props.dialogShowBtn ? this.props.dialogShowBtn : null
                }
                <View style={localStyles.title}>{this.props.content ? this.props.content.header : null}</View>
                <TouchableOpacity onPress={this.onClose}>
                    <Icon size={30} style={{paddingHorizontal: 20}}
                          name={Platform.OS === 'ios' ? 'ios-close' : 'md-close'} />
                </TouchableOpacity>
            </View>
        )
    };

    private renderControls = (text, onPress) => {
        return (
            <View style={localStyles.controls}>
                <View style={localStyles.group}>
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
                <View>
                    {
                        this.props.dialogDeleteBtn ? this.props.dialogDeleteBtn : null
                    }
                </View>
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
                    maxHeight: Dimensions.get('window').height*0.95,
                    borderRadius: 5,
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
                    {this.renderControls('Anuluj', this.onClose)}
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
        height: 40,
        alignItems: 'center',
        // paddingTop: 20,
        // paddingBottom: 20,
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
        justifyContent: 'space-between',
        paddingVertical: 5,
        paddingHorizontal: 10,
    },
    group: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
    }
});

const mapStateToProps = (state: any) => ({
    content: contentSelector(state),
    allowAddPoi: state[moduleName].allowAddPoi,
    dialogSaveBtn: dialogSaveBtnSelector(state),
    dialogDeleteBtn: dialogDeleteBtnSelector(state),
    dialogShowBtn: dialogShowBtnSelector(state),
});

const mapDispatchToProps = (dispatch: any) => (
    bindActionCreators({
        changeControls,
        showDialogContent
    }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(DialogContainer);