import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import MainModalDialog, {TYPES} from "../main.modal";
import {errorSelector, locationSelector, moduleName} from "../../../../redux/modules/map";
import {isSuperADMINAdminSelector} from "../../../../redux/modules/auth";
import {editStation} from "../../../../redux/modules/map/stations";
import {setDialogSaveButton, showDialogContent} from "../../../../redux/modules/dialogs";

class EditStationDialog extends MainModalDialog {
    constructor(p: any) {
        super(p);
        this.title = 'Station';
        this.type = TYPES.STATION;
    }

    render() {
        return super._render();
    }
}

const mapStateToProps = (state: any) => ({
   itemList: state[moduleName].stationList,
   error: errorSelector(state),
   location: locationSelector(state),
   isAdmin: isSuperADMINAdminSelector(state),
});

const mapDispatchToProps = (dispatch: any) => (
    bindActionCreators({
        setDialogSaveButton,
        showDialogContent,
        editItem: editStation,
    }, dispatch)
);

const edit = connect(mapStateToProps, mapDispatchToProps)(EditStationDialog);
export default edit;