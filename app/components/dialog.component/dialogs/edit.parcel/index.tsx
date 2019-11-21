import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import MainModalDialog, {TYPES} from "../main.modal";
import {
    changeControls, drawerStateSelector,
    errorSelector,
    lastGeoPostionsSelector,
    locationSelector,
    moduleName,
} from "../../../../redux/modules/map";
import {isSuperAdminSelector} from "../../../../redux/modules/auth";
import {
    setDialogDeleteButton,
    setDialogSaveButton,
    setDialogShowButton,
    showDialogContent
} from "../../../../redux/modules/dialogs";
import {addPoleParcel, editParcel, editParcelOffline} from "../../../../redux/modules/map/parcels";
import {connectionSelector} from "../../../../redux/modules/connect";

class EditSParcelDialog extends MainModalDialog {
    constructor(p: any) {
        super(p);
        this.title = 'Parcel';
        this.type = TYPES.PARCEL;
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
    itemsList: state[moduleName].parcelList,
    error: errorSelector(state),
    location: locationSelector(state),
    isAdmin: isSuperAdminSelector(state),
    tempPosition: lastGeoPostionsSelector(state),
    connection: connectionSelector(state),
    type: TYPES.PARCEL,
});

const mapDispatchToProps = (dispatch: any) => (
    bindActionCreators({
        changeControls,
        showDialogContent,
        setDialogSaveButton,
        setDialogDeleteButton,
        setDialogShowButton,
        addItem: addPoleParcel,
        editItem: editParcel,
        editItemOffline: editParcelOffline
    }, dispatch)
);

const edit = connect(mapStateToProps, mapDispatchToProps)(EditSParcelDialog);
export default edit;