import React, {Component} from "react";
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import MainModalDialog, {TYPES} from "../main.modal";

import {
    changeControls,
    errorSelector,
    locationSelector,
    locationsSelector,
    moduleName
} from "../../../../redux/modules/map";
import {isSuperADMINAdminSelector} from "../../../../redux/modules/auth";
import {categorySelector} from "../../../../redux/modules/admin";
import {setDialogSaveButton, showDialogContent} from "../../../../redux/modules/dialogs";
import {addPoi, editPoi, removePoi} from "../../../../redux/modules/map/poi";

class AddPoiDialog extends MainModalDialog {
    constructor(p) {
        super(p);
        this.title = 'Poi';
        this.type = TYPES.POI;
    }

    protected handleOk = async (e: any) => {
        try {
            this.setState({__pending: true});
            // this.props.onFinishEditItem(record.data.data);
            const {id}: any = this.state;
            if (id) {
                await this.props.editItem({
                    ...this.state,
                });
            } else {
                this.props.onAddItem({
                    ...this.state,
                    points: this.props.position,
                    projectId: this.props.location.id
                });
                this.props.changeControls({
                    name: 'allowAddPoi',
                    value: false
                });
            }

        } catch (e) {
            // const {toast}: any = this.refs;
            // toast.show(e.response ? e.response.data.error || e.response.data.message : e.meesage || e, {
            //     position: toast.POSITION.TOP_LEFT
            // });
        } finally {
            // setTimeout(() => {
            this.setState({__pending: false});
            this.handleCancel(e);
            // }, 1000)
        }
    };

    protected handleCancel = (e: any) => {
        this.props.showDialogContent(null);
    };

    render() {
        return super._render();
    }
}

const mapStateToProps = (state: any) => ({
    itemsList: state[moduleName].parcelList,
    allowAddPoi: state[moduleName].allowAddPoi,
    isAdmin: isSuperADMINAdminSelector(state),
    error: errorSelector(state),
    location: locationSelector(state),
    projects: locationsSelector(state),
    categories: categorySelector(state),
});

const mapDispatchToProps = (dispatch: any) => (
    bindActionCreators({
        setDialogSaveButton,
        showDialogContent,
        changeControls,
        editItem: editPoi,
        onDeleteItem: removePoi,
        onAddItem: addPoi,
    }, dispatch)
);

const edit = connect(mapStateToProps, mapDispatchToProps)(AddPoiDialog);
export default edit;