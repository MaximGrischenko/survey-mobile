import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {alertTextSelector, showAlert} from "../../redux/modules/dialogs";
import {changeControls, moduleName} from "../../redux/modules/map";
import {Dimensions, Platform, StyleSheet, TouchableOpacity, View, Text} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import {PrimaryButton} from "../buttons/primary.button";
import Modal from "react-native-modal";
import {COLORS} from "../../styles/colors";

interface IMapProps {
    changeControls: Function,
    allowAddPoi: any,
    showAlert: any,
    alertText: string
}

class AlertContainer extends Component<IMapProps> {

    private onClose = () => {
        if(this.props.allowAddPoi) {
            this.props.changeControls({
                name: 'allowAddPoi',
                value: false
            })
        }
       this.props.showAlert(false);
    };

    private renderHeader = () => {
        return (
            <View style={localStyles.header}>
                <Text style={localStyles.title}>Warning</Text>
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
        return (
            <View style={this.props.alertText ? localStyles.container : null}>
                <Modal
                    isVisible={!!this.props.alertText}
                    animationIn={'zoomInDown'}
                    animationOut={'zoomOutUp'}
                    onBackdropPress={this.onClose}
                    animationInTiming={250}
                    animationOutTiming={250}
                    backdropTransitionInTiming={250}
                    backdropTransitionOutTiming={250}
                >
                    <View style={localStyles.content}>
                        {this.renderHeader()}
                        {/*<View style={localStyles.content}>*/}
                            <Text>{this.props.alertText}</Text>
                        {/*</View>*/}
                        {this.renderControls('Confirm', this.onClose)}
                    </View>
                </Modal>
            </View>
        )
    }
}

const localStyles = StyleSheet.create({
    container: {
       // flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        paddingLeft: 10,
        paddingRight: 10,
    },
    content: {
        padding: 10,
        backgroundColor: COLORS.BACKGROUND,
        borderRadius: 5,
      //  width: Dimensions.get('window').width - 20,
    },
    header: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 20,
        paddingBottom: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    controls: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        paddingTop: 30,
        paddingLeft: 10
    }
});

const mapStateToProps = (state: any) => ({
    alertText: alertTextSelector(state),
    allowAddPoi: state[moduleName].allowAddPoi,
});

const mapDispatchToProps = (dispatch: any) => (
    bindActionCreators({
        showAlert,
        changeControls
    }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(AlertContainer);