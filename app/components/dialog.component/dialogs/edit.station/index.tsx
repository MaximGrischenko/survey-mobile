import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import MainModalDialog, {TYPES} from "../main.modal";
import {
    changeControls,
    drawerStateSelector,
    errorSelector,
    locationSelector,
    moduleName
} from "../../../../redux/modules/map";
import {isSuperAdminSelector} from "../../../../redux/modules/auth";
import {editStation, editStationOffline} from "../../../../redux/modules/map/stations";
import {
    setDialogDeleteButton,
    setDialogSaveButton,
    setDialogShowButton,
    showDialogContent
} from "../../../../redux/modules/dialogs";
import {connectionSelector} from "../../../../redux/modules/connect";

class EditStationDialog extends MainModalDialog {
    constructor(p: any) {
        super(p);
        this.title = 'Station';
        this.type = TYPES.STATION;
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
    itemsList: state[moduleName].stationList,
    error: errorSelector(state),
    location: locationSelector(state),
    isAdmin: isSuperAdminSelector(state),
    connection: connectionSelector(state),
});

const mapDispatchToProps = (dispatch: any) => (
    bindActionCreators({
        changeControls,
        setDialogSaveButton,
        setDialogDeleteButton,
        setDialogShowButton,
        showDialogContent,
        editItem: editStation,
        editItemOffline: editStationOffline
    }, dispatch)
);

const edit = connect(mapStateToProps, mapDispatchToProps)(EditStationDialog);
export default edit;