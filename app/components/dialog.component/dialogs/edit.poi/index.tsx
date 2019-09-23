import React from "react";
import * as Location from "expo-location";
import * as Permissions from 'expo-permissions';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import MainModalDialog, {TYPES} from "../main.modal";

import {
    applyGeoposition,
    changeControls,
    errorSelector,
    locationSelector,
    locationsSelector,
    moduleName
} from "../../../../redux/modules/map";
import {isSuperADMINAdminSelector} from "../../../../redux/modules/auth";
import {categorySelector} from "../../../../redux/modules/admin";
import {setDialogSaveButton, showAlert, showDialogContent} from "../../../../redux/modules/dialogs";
import {addPoi, editPoi, removePoi} from "../../../../redux/modules/map/poi";
import {AsyncStorage} from "react-native";
import {Geometry} from "../../../../entities";

class EditPoiDialog extends MainModalDialog {
    constructor(p) {
        super(p);
        this.title = 'Poi';
        this.type = TYPES.POI;
    }

    componentDidMount(): void {
        super.componentDidMount();
    }

    protected handleOk = async (e: any) => {
        try {
            this.setState({__pending: true});
            const {id}: any = this.state;
            if (id) {
                console.log('EDIT', this.state);
                await this.props.editItem({
                    ...this.state,
                });
            } else {
                let position = this.props.position;
                if(this.state.current === 'current') {

                    let hasLocationPermissions = false;
                    let locationResult = null;

                    let {status} = await Permissions.askAsync(Permissions.LOCATION);

                    if(status !== 'granted') {
                        locationResult = 'Permission to access location was denied';
                        this.props.showAlert(locationResult);
                    } else {
                        hasLocationPermissions = true;
                    }

                    // let location = await AsyncStorage.getItem('location');
                    let location = await Location.getCurrentPositionAsync({
                        enableHighAccuracy: true, timeout: 20000,
                    });
                    await applyGeoposition(location);
                  //  if(location) {
                  //      const GEOPosition = JSON.parse(location);
                        position = new Geometry(Geometry.TYPE.POINT, [location.coords.longitude, location.coords.latitude]);
                 //   }
                }
                console.log('before add');
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
            this.handleCancel(e);
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
        showAlert,
        changeControls,
        editItem: editPoi,
        onDeleteItem: removePoi,
        onAddItem: addPoi,
    }, dispatch)
);

const edit = connect(mapStateToProps, mapDispatchToProps)(EditPoiDialog);
export default edit;