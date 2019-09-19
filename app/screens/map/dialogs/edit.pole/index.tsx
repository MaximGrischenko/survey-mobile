import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import MainModalDialog, {TYPES} from "../main.modal";
import {errorSelector, locationSelector, moduleName, powerlinesSelector} from "../../../../redux/modules/map";
import {isSuperADMINAdminSelector} from "../../../../redux/modules/auth";
import {addPole, editPole} from "../../../../redux/modules/map/poles";
import {setDialogSaveButton, showDialogContent} from "../../../../redux/modules/dialogs";

class EditPoleDialog extends MainModalDialog {
    constructor(p: any) {
        super(p);
        this.title = 'Pole';
        this.type = TYPES.POLE;
    }

    componentDidUpdate(prevProps: any, prevState: any, snapshot?: any): void {
        console.log('====', this.props.itemsList);
    }

    render() {
        return super._render();
    }
}

const mapStateToProps = (state: any) => ({
    itemsList: state[moduleName].polesList,
    error: errorSelector(state),
    isAdmin: isSuperADMINAdminSelector(state),
    location: locationSelector(state),
    powerlines: powerlinesSelector(state),
});

const mapDispatchToProps = (dispatch: any) => (
    bindActionCreators({
        setDialogSaveButton,
        showDialogContent,
        editItem: editPole,
        addItem: addPole,
    }, dispatch)
);

const edit = connect(mapStateToProps, mapDispatchToProps)(EditPoleDialog);
export default edit;