import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import MainModalDialog, {TYPES} from "../main.modal";
import {
    changeControls, drawerStateSelector,
    errorSelector,
    lastGeoPostionsSelector,
    locationSelector,
    moduleName
} from "../../../../redux/modules/map";
import {isSuperAdminSelector} from "../../../../redux/modules/auth";
import {
    showDialogContent,
    setDialogSaveButton,
    setDialogDeleteButton,
    setDialogShowButton
} from "../../../../redux/modules/dialogs";
import {addSegments, editSegmentOffline, editSegments} from "../../../../redux/modules/map/segments";
import {connectionSelector} from "../../../../redux/modules/connect";

class EditSegmentDialog extends MainModalDialog {
    constructor(p: any) {
        super(p);
        this.title = 'Segment';
        this.type = TYPES.SEGMENT;
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
    itemsList: state[moduleName].segmentList,
    error: errorSelector(state),
    location: locationSelector(state),
    isAdmin: isSuperAdminSelector(state),
    tempPosition: lastGeoPostionsSelector(state),
    connection: connectionSelector(state),
});

const mapDispatchToProps = (dispatch: any) => (
    bindActionCreators({
        changeControls,
        setDialogSaveButton,
        setDialogDeleteButton,
        setDialogShowButton,
        showDialogContent,
        editItem: editSegments,
        editItemOffline: editSegmentOffline,
        addItem: addSegments
    }, dispatch)
);

const edit = connect(mapStateToProps, mapDispatchToProps)(EditSegmentDialog);
export default edit;