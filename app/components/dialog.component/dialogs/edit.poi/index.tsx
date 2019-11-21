import React from "react";
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import MainModalDialog, {TYPES} from "../main.modal";

import {
    changeControls, drawerStateSelector,
    errorSelector,
    locationSelector,
    locationsSelector,
    moduleName
} from "../../../../redux/modules/map";
import {isSuperAdminSelector, userSelector} from "../../../../redux/modules/auth";
import {categorySelector} from "../../../../redux/modules/admin";
import {
    setDialogDeleteButton,
    setDialogSaveButton, setDialogShowButton,
    showAlert,
    showDialogContent
} from "../../../../redux/modules/dialogs";
import {
    addPoi,
    addPoiOffline,
    editPoi,
    editPoiOffline,
    removePoi,
    removePoiOffline
} from "../../../../redux/modules/map/poi";
import {connectionSelector} from "../../../../redux/modules/connect";

class EditPoiDialog extends MainModalDialog {
    constructor(p) {
        super(p);
        this.title = 'Poi';
        this.type = TYPES.POI;
        this.canDelete = false;
        this.editTitle = true;
        this.canDisplay = true;
    }

    componentWillMount(): void {
        const {id} = this.state;
        this.canDelete = !!id;
        this.canDisplay = !!id;
    }

    componentDidMount(): void {
        super.componentDidMount();
    }

    protected handleSave = async () => {
        try {
            this.setState({__pending: true});
            const {id}: any = this.state;
            if (id) {
                if(this.props.connection) {
                    await this.props.editItem({
                        ...this.state,
                    });
                } else {
                    this.props.editItemOffline({
                        ...this.state,
                    });
                }
            } else {
                let position = this.props.position;
                if(this.props.connection) {
                    this.props.onAddItem({
                        ...this.state,
                        points: position,
                        projectId: this.props.location.id
                    });
                } else {
                    this.props.onAddItemOffline({
                        ...this.state,
                        points: position,
                        userId: this.props.user.info.data.id,
                        projectId: this.props.location.id
                    });
                }
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
    isDrawerOpen: drawerStateSelector(state),
    itemsList: state[moduleName].poiList,
    isAdmin: isSuperAdminSelector(state),
    error: errorSelector(state),
    location: locationSelector(state),
    projects: locationsSelector(state),
    categories: categorySelector(state),
    user: userSelector(state),
    connection: connectionSelector(state),
});

const mapDispatchToProps = (dispatch: any) => (
    bindActionCreators({
        setDialogSaveButton,
        setDialogDeleteButton,
        setDialogShowButton,
        showDialogContent,
        showAlert,
        changeControls,
        editItem: editPoi,
        editItemOffline: editPoiOffline,
        onDeleteItem: removePoi,
        onDeleteItemOffline: removePoiOffline,
        onAddItem: addPoi,
        onAddItemOffline: addPoiOffline
    }, dispatch)
);

const edit = connect(mapStateToProps, mapDispatchToProps)(EditPoiDialog);
export default edit;