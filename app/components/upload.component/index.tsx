import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {Alert, AsyncStorage, Dimensions, View} from "react-native";
import Modal from "react-native-modal";
import {PrimaryButton} from "../buttons/primary.button";

import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';
import * as FileSystem from 'expo-file-system';

import {showAlert} from "../../redux/modules/dialogs";
import {Upload} from "../../entities";
import {uploadAssetsAsync} from "../../utils/upload.assets";
import Carousel, {Pagination} from 'react-native-snap-carousel';

import {sliderWidth, itemWidth} from "../../styles/carousel/SliderEntry.style";
import styles, {colors} from '../../styles/carousel/index.style';
import SliderEntry from "../uploads.preview";
import {COLORS} from "../../styles/colors";
import {connectionSelector} from "../../redux/modules/connect";

interface IMapProps {
    showAlert: Function,
    files: Array<Upload>,
    onUpload: Function,
    onUpdate: Function,
    connection: boolean,
}

interface IMapState {
    files: Array<Upload>,
    expanded: boolean,
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
            expanded: false,
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
            'Załaduj zdjęcie',
            '',
            [
                {
                    text: 'Zrób zdjęcie', onPress: async () => {
                        let picker = await ImagePicker.launchCameraAsync( {
                            mediaTypes: ImagePicker.MediaTypeOptions.Images,
                            allowsEditing: false,
                            quality: 0.5,
                            exif: true,
                        });

                        await this.handleSave(picker);
                    }
                },
                {
                    text: 'Dodaj z galerii', onPress: async () => {
                        let picker = await ImagePicker.launchImageLibraryAsync({
                            mediaTypes: ImagePicker.MediaTypeOptions.Images,
                            allowsEditing: false,
                            quality: 0.5,
                            exif: true,
                        });

                        await this.handleSave(picker);
                    }
                }
            ]
        );
    };

    private handleSave = async (picker) => {
        let response;
        try {
            if(!picker.cancelled) {
                if(this.props.connection) {
                    const file = {
                        uri: picker.uri.toString(),
                        name: 'photo.jpg',
                        filename :'imageName.jpg',
                        type: 'image/jpeg'
                    };
                    let token = await AsyncStorage.getItem('access_token');
                    response = await uploadAssetsAsync(file, token);
                    this.setState({
                        files: [...this.state.files, new Upload(response)]
                    });
                } else {
                    const check = await FileSystem.getInfoAsync(FileSystem.documentDirectory + '/uploads');
                    if(!check.isDirectory && !check.exists) {
                        await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + '/uploads', {intermediates: true});
                    }
                    try {
                        await FileSystem.moveAsync({
                            from: picker.uri,
                            to: FileSystem.documentDirectory + `uploads/${picker.uri.substring(picker.uri.lastIndexOf('/') + 1)}`
                        });
                        const upload = {
                            path: picker.uri.substring(picker.uri.lastIndexOf('/') + 1),
                        };
                        this.setState({
                            files: [...this.state.files, new Upload(upload)]
                        })
                    } catch(error) {
                        console.log(error);
                    }
                }
            }
        } catch(error) {
            console.log(error);
        } finally {
            this.props.onUpload(this.state.files);
        }
    };

    private handleDelete = async (el: any) => {
        if(!this.props.connection) {
            try {
                await FileSystem.deleteAsync(FileSystem.documentDirectory  + `uploads/${el}`);
            } catch(error) {
                console.log(error);
            }
        }
        this.setState({
            files: this.state.files.filter((els) => el !== els.path)
        }, () => {
            this.props.onUpdate(this.state.files)
        });
    };

    private handleExpand = (expand) => {
        this.setState({
            expanded: !expand
        })
    };

    private renderUploads = ({item, index}, parallaxProps) => {
        return (
            <SliderEntry
                connection={this.props.connection}
                data={item}
                even={(index + 1) % 2 === 0}
                expanded={this.state.expanded}
                parallax={false}
                parallaxProps={parallaxProps}
                onDelete={this.handleDelete}
                onExpand={this.handleExpand}/>
        )
    };

    render() {
        const { width: viewportWidth, height: viewportHeight } = Dimensions.get('window');
        return (
            <React.Fragment>
                <PrimaryButton
                    style={{marginLeft: 15, marginRight: 15, marginTop: 10, borderColor: COLORS.PRIMARY, borderWidth: 1, borderRadius: 8}}
                    title={'Załaduj zdjęcie'}
                    variant={"secondary"}
                    onPress={this.handlePick}
                />
                <View style={{
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center'}}>
                    <Modal isVisible={this.state.expanded}
                           animationIn={'zoomInDown'}
                           animationOut={'zoomOutUp'}
                           animationInTiming={250}
                           animationOutTiming={250}
                           backdropTransitionInTiming={250}
                           backdropTransitionOutTiming={250}
                    >
                        <View style={{width: viewportWidth, height: viewportHeight - 40, backgroundColor: COLORS.BACKGROUND, borderRadius: 10, left: -15}}>
                            <Carousel
                                ref={(ref) => {this.carousel = ref;}}
                                data={this.state.files}
                                hasParallaxImages={false}
                                renderItem={this.renderUploads}
                                sliderWidth={viewportWidth}
                                itemWidth={viewportWidth}
                                inactiveSlideScale={1}
                                inactiveSlideOpacity={1}
                                slideStyle={{ width: viewportWidth}}
                                enableMomentum={true}
                                onSnapToItem={(index) => this.setState({active: index})}
                            />
                            <Pagination
                                dotsLength={this.state.files.length}
                                activeDotIndex={this.state.active}
                                containerStyle={{paddingVertical: 12}}
                                dotColor={COLORS.PRIMARY}
                                dotStyle={styles.paginationDot}
                                inactiveDotColor={COLORS.PRIMARY}
                                inactiveDotOpacity={0.4}
                                inactiveDotScale={0.6}
                                carouselRef={this.carousel}
                                tappableDots={!!this.carousel}
                            />
                        </View>
                    </Modal>
                </View>

                <Carousel
                    ref={(ref) => {this.carousel = ref;}}
                    data={this.state.files}
                    //layout={'stack'}
                    hasParallaxImages={false}
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
    connection: connectionSelector(state)
});

const mapDispatchToProps = (dispatch: any) => (
    bindActionCreators({
        showAlert,
    }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(UploadComponent);