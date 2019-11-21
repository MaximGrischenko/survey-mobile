import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import MainModalDialog, {TYPES} from "../main.modal";
import {
    changeControls, drawerStateSelector,
    errorSelector,
    locationSelector,
    moduleName,
    powerlinesSelector
} from "../../../../redux/modules/map";
import {isSuperAdminSelector} from "../../../../redux/modules/auth";
import {addPole, editPole, editPoleOffline} from "../../../../redux/modules/map/poles";
import {
    setDialogDeleteButton,
    setDialogSaveButton,
    setDialogShowButton,
    showDialogContent
} from "../../../../redux/modules/dialogs";
import {connectionSelector} from "../../../../redux/modules/connect";

class EditPoleDialog extends MainModalDialog {
    constructor(p: any) {
        super(p);
        this.title = 'Pole';
        this.type = TYPES.POLE;
        this.canDelete = false;
        this.canDisplay = true;
        this.editTitle = false;
    }

    render() {
        return super._render();
    }
}

const mapStateToProps = (state: any) => ({
    isDrawerOpen: drawerStateSelector(state),
    itemsList: state[moduleName].polesList,
    error: errorSelector(state),
    isAdmin: isSuperAdminSelector(state),
    location: locationSelector(state),
    powerlines: powerlinesSelector(state),
    connection: connectionSelector(state),
});

const mapDispatchToProps = (dispatch: any) => (
    bindActionCreators({
        changeControls,
        setDialogSaveButton,
        setDialogDeleteButton,
        setDialogShowButton,
        showDialogContent,
        editItem: editPole,
        editItemOffline: editPoleOffline,
        addItem: addPole,
    }, dispatch)
);

const edit = connect(mapStateToProps, mapDispatchToProps)(EditPoleDialog);
export default edit;