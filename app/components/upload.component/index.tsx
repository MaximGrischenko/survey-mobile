import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import axios from 'react-native-axios';
import {View} from "react-native";
import {PrimaryButton} from "../buttons/primary.button";

import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';
import {API} from "../../config";

import {showAlert} from "../../redux/modules/dialogs";
import {Upload} from "../../entities";

import {Image} from 'react-native';

interface IMapProps {
    showAlert: Function,
    files: Array<Upload>,
    onUpload: Function
}

interface IMapState {
    files: Array<Upload>,
    uri: any,
}

class UploadComponent extends Component<IMapProps, IMapState> {

    static defaultProps = {
        onUpload: () => 0,
        files: []
    };

    constructor(p) {
        super(p);

        this.state = {
            files: [...this.props.files],
            uri: '',
        }
    }

    componentDidMount(): void {
        this.getPermissionsAync();
    }

    getPermissionsAync = async () => {
        let permissionResult = null;

        const {
            status: cameraRollPermission
        } = await Permissions.askAsync(Permissions.CAMERA_ROLL);

        if(cameraRollPermission !== 'granted') {
            permissionResult = 'Permission to access gallery was denied';
            this.props.showAlert(permissionResult);
        }
    };

    private handlePick = async () => {
        let pickerResult = await ImagePicker.launchImageLibraryAsync({
           mediaTypes: ImagePicker.MediaTypeOptions.Images,
           allowsEditing: true,
           aspect: [4, 3]
        });

        this.setState({
            uri: pickerResult,
        });

        await this.handleSave(pickerResult);
        //
        // const {cancelled, uri} = result;
        // if(!cancelled) {
        //    await this.uploadImageAsync(uri);
        // }


    };

    private handleSave = async (pickerResult) => {
        let uploadResponse;

        const fileList: any = [...this.state.files];
       // const fileListNew: any = [];

        try {
            if(!pickerResult.cancelled) {
                uploadResponse = this.uploadImageAsync(pickerResult.uri);
                await uploadResponse.then((res)=>{
                    const {data}: any = res;
                    fileList.push(new Upload(data));
                });
            }
        } catch (e) {

        } finally {
            this.props.onUpload(fileList);
        }
    };

    private renderImage = () => {

    };

    private uploadImageAsync = async (uri) => {

        return new Promise((resolve, reject) => {
            fetch(uri).then((data) => {
                data.blob().then((uploaded) => {
                    const formData = new FormData();
                    console.log('uploaded', uploaded);
                    console.log('file', new File([uploaded], 'aaa.jpg'));
                    formData.append('file', new File([uploaded], 'aaa.jpg'));

                    axios.post(`${API}api/uploads`, formData, {
                        onUploadProgress: progressEvent => {
                            uri.uploadStatus = (progressEvent.loaded / progressEvent.total * 100);
                        },
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    }).then((res) => {
                        resolve(res)
                    }).catch(reject)
                });
            }).catch(reject)
        });
    };

    render() {
        console.log('state', this.state.uri);
        return (
            <React.Fragment>
                <PrimaryButton
                    style={{marginLeft: 15, marginRight: 15}}
                    title={'UPLOAD'}
                    variant={"secondary"}
                    onPress={this.handlePick}
                />
                <View>
                    <Image source={{uri: this.state.uri.uri}} style={{ width: 300, height: 300 }} />
                </View>
            </React.Fragment>
        )
    }
}

const mapStateToProps = (state: any) => ({

});

const mapDispatchToProps = (dispatch: any) => (
    bindActionCreators({
        showAlert,
    }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(UploadComponent);