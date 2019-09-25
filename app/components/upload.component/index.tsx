import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import axios from 'react-native-axios';
import {Platform, View} from "react-native";
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
    photo: any,
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
            photo: null,
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
           aspect: [4, 3],
            // exif: true,
            // base64: true,
        });

        // this.setState({
        //     photo: pickerResult,
        // });

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

                const response = await fetch(Platform.OS === 'android' ? pickerResult.uri : pickerResult.uri.replace('file://', ''));
                console.log('fetch', response);
                const blob: any = await response.blob();
                console.log('blob', blob.data);
                const file = {uri: pickerResult.uri, name: 'photo.jpg',filename :'imageName.jpg',type: 'image/jpeg'}
                // const file = new File([blob], blob.data.name, {type: blob.data.type, lastModified: Date.now()});
                console.log('file', file);

                uploadResponse = this.uploadImageAsync(file, pickerResult.uri); //pickerResult.uri
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

    private uploadImageAsync = async (file: any, URI: any) => {
        return new Promise((resolve, reject) => {
            // fetch(Platform.OS === 'android' ? uri : uri.replace("file://", "")).then((data) => {
            //     data.blob().then((uploaded) => {
                    const formData = new FormData();
            console.log(1111111, URI);
            // formData.append('photo', {uri: URI, name: 'photo.jpg',filename :'imageName.jpg',type: 'image/jpeg'});
            // formData.append('Content-Type', 'image/jpeg');
                    // console.log('uploaded', uploaded);
                    // console.log('file', new File([uploaded], 'aaa.jpg'));
                    formData.append('fileData', file); // new File([uploaded], 'aaa.jpg')
                    console.log('formData', formData);

                    // axios.post(`${API}api/uploads`, formData, {
                    //     // onUploadProgress: progressEvent => {
                    //     //     blob.uploadStatus = (progressEvent.loaded / progressEvent.total * 100);
                    //     // },
                    //     headers: {
                    //         'Content-Type': 'multipart/form-data'
                    //     }
                    // })
                    axios({
                        method: 'post',
                        url: `${API}api/uploads`,
                        data: formData,
                        config: { headers: {'Content-Type': 'multipart/form-data' }}
                    }).then((res) => {
                        console.log('response', res);
                        resolve(res)
                    }).catch((error) => {
                        console.log('error', error);
                        reject(error);
                    })
                });
            // }).catch(reject)
        // });
    };

    render() {
        // console.log('state', this.state.uri);
        return (
            <React.Fragment>
                <PrimaryButton
                    style={{marginLeft: 15, marginRight: 15}}
                    title={'UPLOAD'}
                    variant={"secondary"}
                    onPress={this.handlePick}
                />
                {/*<View>*/}
                {/*    <Image source={{uri: this.state.photo.uri}} style={{ width: 300, height: 300 }} />*/}
                {/*</View>*/}
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