import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import axios from 'react-native-axios';
import {Alert, AsyncStorage, Platform, View} from "react-native";
import {PrimaryButton} from "../buttons/primary.button";

import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';
import {API} from "../../config";

import {showAlert} from "../../redux/modules/dialogs";
import {Upload} from "../../entities";


import Carousel, {Pagination} from 'react-native-snap-carousel';

import {sliderWidth, itemWidth} from "../../styles/carousel/SliderEntry.style";
import styles, {colors} from '../../styles/carousel/index.style';
import {Image} from 'react-native';
import {entries} from "../dialog.component/dialogs/main.modal/entries";
import SliderEntry from "../uploads.preview";
import {COLORS} from "../../styles/colors";

interface IMapProps {
    showAlert: Function,
    files: Array<Upload>,
    onUpload: Function,
    onUpdate: Function,
}

interface IMapState {
    files: Array<Upload>,
    photo: any,
    active: number
}
class UploadComponent extends Component<IMapProps, IMapState> {

    private carousel: null;

    static defaultProps = {
        onUpload: () => 0,
        files: []
    };

    constructor(p) {
        super(p);

        this.state = {
            files: [...this.props.files],
            photo: null,
            active: 0
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
        Alert.alert(
            'Upload image',
            '',
            [
                {
                    text: 'Take a photo', onPress: async () => {
                        let picker = await ImagePicker.launchCameraAsync( {
                            mediaTypes: ImagePicker.MediaTypeOptions.Images,
                            allowsEditing: false,
                           // aspect: [4, 3],
                            exif: true
                        });

                        await this.handleSave(picker);
                    }
                },
                {
                    text: 'Upload image', onPress: async () => {
                        let picker = await ImagePicker.launchImageLibraryAsync({
                            mediaTypes: ImagePicker.MediaTypeOptions.Images,
                            allowsEditing: false,
                          //  aspect: [4, 3],
                            exif: true,
                        });

                        await this.handleSave(picker);
                    }
                }
            ]
        );


        // let pickerResult = await ImagePicker.launchImageLibraryAsync({
        //     mediaTypes: ImagePicker.MediaTypeOptions.Images,
        //     allowsEditing: true,
        //     aspect: [4, 3],
        //     exif: true,
        // });

      //  await this.handleSave(picker);
    };

    private handleSave = async (picker) => {
        let response;
        // const fileList: any = [...this.state.files];

        try {
            if(!picker.cancelled) {
                const file = {
                    uri: picker.uri.toString(),
                    name: 'photo.jpg',
                    filename :'imageName.jpg',
                    type: 'image/jpeg'
                };

                let token = await AsyncStorage.getItem('access_token');

                response = await this.uploadImageAsync(file, token);

                // this.state.files.push(new Upload(response));

                this.setState({
                    files: [...this.state.files, new Upload(response)]
                })
            }
        } catch (e) {
            console.log(e);
        } finally {
            this.props.onUpload(this.state.files);
        }
    };

    private handleDelete = (el: any) => {
        console.log('el', el);

        this.setState({
            files: this.state.files.filter((els) => el !== els.path)
        }, () => {
            this.props.onUpdate(this.state.files)
        });
    };

    private renderUploads = ({item, index}, parallaxProps) => {
        return (
            <SliderEntry data={item} even={(index + 1) % 2 === 0} onPress={this.handleDelete} parallax={true} parallaxProps={parallaxProps}/>
        )
    };

    private uploadImageAsync = async (file: any, token: any) => {
        return new Promise((resolve, reject) => {

            const body = new FormData();
            body.append('filesData', file);
            const xhr = new XMLHttpRequest();

            xhr.open('POST', `${API}api/uploads`);
            xhr.setRequestHeader('authorization', token);
            xhr.responseType = 'json';
            xhr.send(body);
            xhr.onerror = function(e) {
                reject(e)
            };
            xhr.onload = function() {
                let responseObj = xhr.response;
                console.log('RESP ', responseObj);
                resolve(responseObj);
            };
        });
    };

    render() {
        // console.log('state', this.state.uri);
        return (
            <React.Fragment>
                <PrimaryButton
                    style={{marginLeft: 15, marginRight: 15, marginTop: 10, borderColor: COLORS.PRIMARY, borderWidth: 1, borderRadius: 8}}
                    title={'UPLOAD IMAGE'}
                    variant={"secondary"}
                    onPress={this.handlePick}
                />
                {/*<View>*/}
                {/*    <Image source={{uri: this.state.photo.uri}} style={{ width: 300, height: 300 }} />*/}
                {/*</View>*/}
                <Carousel
                    ref={(ref) => {this.carousel = ref;}}
                    data={this.state.files}
                    //layout={'stack'}
                    hasParallaxImages={true}
                   // layoutCardOffset={15}
                    renderItem={this.renderUploads}
                    sliderWidth={sliderWidth}
                    itemWidth={itemWidth}
                    inactiveSlideScale={0.9}
                    inactiveSlideOpacity={0.7}
                    enableMomentum={true}
                    activeSlideAlignment={'center'}
                    containerCustomStyle={styles.slider}
                    contentContainerCustomStyle={styles.sliderContentContainer}
                    onSnapToItem={(index) => this.setState({active: index})}
                    //activeAnimationType={'spring'}
                    //activeAnimationOptions={{
                    //    friction: 4,
                    //    tension: 40
                    //}}
                />
                <Pagination
                    dotsLength={this.state.files.length}
                    activeDotIndex={this.state.active}
                    containerStyle={styles.paginationContainer}
                    dotColor={COLORS.PRIMARY}
                    dotStyle={styles.paginationDot}
                    inactiveDotColor={COLORS.PRIMARY}
                    inactiveDotOpacity={0.4}
                    inactiveDotScale={0.6}
                    carouselRef={this.carousel}
                    tappableDots={!!this.carousel}
                />
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