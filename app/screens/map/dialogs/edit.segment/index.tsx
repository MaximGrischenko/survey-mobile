import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import MainModalDialog, {TYPES} from "../main.modal";
import {
    changeControls,
    errorSelector,
    lastGeoPostionsSelector,
    locationSelector,
    moduleName
} from "../../../../redux/modules/map";
import {isSuperADMINAdminSelector} from "../../../../redux/modules/auth";
import {showDialogContent, setDialogSaveButton} from "../../../../redux/modules/dialogs";
import {addSegments, editSegments} from "../../../../redux/modules/map/segments";

class EditSegmentDialog extends MainModalDialog {
    constructor(p: any) {
        super(p);
        this.title = 'Segment';
        this.type = TYPES.SEGMENT;
    }

    render() {
        return super._render();
    }
}

const mapStateToProps = (state: any) => ({
    itemsList: state[moduleName].segmentList,
    error: errorSelector(state),
    location: locationSelector(state),
    isAdmin: isSuperADMINAdminSelector(state),
    tempPosition: lastGeoPostionsSelector(state)
});

const mapDispatchToProps = (dispatch: any) => (
    bindActionCreators({
        changeControls,
        setDialogSaveButton,
        showDialogContent,
        editItem: editSegments,
        addItem: addSegments
    }, dispatch)
);

const edit = connect(mapStateToProps, mapDispatchToProps)(EditSegmentDialog);
export default edit;