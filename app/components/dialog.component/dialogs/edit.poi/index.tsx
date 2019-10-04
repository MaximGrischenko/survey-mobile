import React from "react";
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
import {isSuperAdminSelector} from "../../../../redux/modules/auth";
import {categorySelector} from "../../../../redux/modules/admin";
import {
    setDialogDeleteButton,
    setDialogSaveButton,
    showAlert,
    showDialogContent
} from "../../../../redux/modules/dialogs";
import {addPoi, editPoi, removePoi} from "../../../../redux/modules/map/poi";

class EditPoiDialog extends MainModalDialog {
    constructor(p) {
        super(p);
        this.title = 'Poi';
        this.type = TYPES.POI;
        this.canDelete = true;
        this.editTitle = true;
    }

    componentDidMount(): void {
        super.componentDidMount();
    }

    protected handleSave = async () => {
        try {
            this.setState({__pending: true});
            const {id}: any = this.state;
            if (id) {
                await this.props.editItem({
                    ...this.state,
                });
            } else {
                let position = this.props.position;
                this.props.onAddItem({
                    ...this.state,
                    points: position,
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
            this.setState({__pending: false});
            this.handleCancel({});
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
    itemsList: state[moduleName].poiList,
    isAdmin: isSuperAdminSelector(state),
    error: errorSelector(state),
    location: locationSelector(state),
    projects: locationsSelector(state),
    categories: categorySelector(state),
});

const mapDispatchToProps = (dispatch: any) => (
    bindActionCreators({
        setDialogSaveButton,
        setDialogDeleteButton,
        showDialogContent,
        showAlert,
        changeControls,
        editItem: editPoi,
        onDeleteItem: removePoi,
        onAddItem: addPoi,
    }, dispatch)
);

const edit = connect(mapStateToProps, mapDispatchToProps)(EditPoiDialog);
export default edit;