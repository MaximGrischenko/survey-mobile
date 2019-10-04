import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import MainModalDialog, {TYPES} from "../main.modal";
import {
    changeControls,
    errorSelector,
    lastGeoPostionsSelector,
    locationSelector,
    moduleName,
} from "../../../../redux/modules/map";
import {isSuperAdminSelector} from "../../../../redux/modules/auth";
import {setDialogDeleteButton, setDialogSaveButton, showDialogContent} from "../../../../redux/modules/dialogs";
import {addPoleParcel, editParcel} from "../../../../redux/modules/map/parcels";

class EditSParcelDialog extends MainModalDialog {
    constructor(p: any) {
        super(p);
        this.title = 'Parcel';
        this.type = TYPES.PARCEL;
        this.canDelete = false;
        this.editTitle = false;
    }

    render() {
        return super._render();
    }
}

const mapStateToProps = (state: any) => ({
    itemsList: state[moduleName].parcelList,
    error: errorSelector(state),
    location: locationSelector(state),
    isAdmin: isSuperAdminSelector(state),
    tempPosition: lastGeoPostionsSelector(state)
});

const mapDispatchToProps = (dispatch: any) => (
    bindActionCreators({
        changeControls,
        showDialogContent,
        setDialogSaveButton,
        setDialogDeleteButton,
        addItem: addPoleParcel,
        editItem: editParcel,
    }, dispatch)
);

const edit = connect(mapStateToProps, mapDispatchToProps)(EditSParcelDialog);
export default edit;