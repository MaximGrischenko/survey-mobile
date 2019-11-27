import React, { Component } from 'react';
import {View, Text, Image, TouchableOpacity, Platform, Dimensions, TouchableWithoutFeedback} from 'react-native';
import DoubleClickButton from "../buttons/double-click.button";
import { ParallaxImage } from 'react-native-snap-carousel';
import styles from '../../styles/carousel/SliderEntry.style';
import {API} from "../../config";
import Icon from "react-native-vector-icons/Ionicons";
import {COLORS} from "../../styles/colors";
import * as FileSystem from 'expo-file-system';

interface IMapProps {
    connection: boolean,
    data: any,
    even: boolean,
    expanded: boolean,
    parallax: boolean,
    parallaxProps: any,
    onDelete: Function,
    onExpand: Function,
}

export default class SliderEntry extends Component<IMapProps> {

    private renderImage () {
        const {data: {path}, even, parallax, parallaxProps, connection, expanded} = this.props;

        let url = "";
        if(connection) {
            url = `${API}resources`;
        } else {
            url = FileSystem.documentDirectory + '/uploads';
        }
        return parallax ? (
            <DoubleClickButton style={{flex: 1}} onDoubleTap={() => this.props.onExpand(expanded)}>
                <ParallaxImage
                    source={{ uri: `${url}/${path}` }}
                    containerStyle={[styles.imageContainer, even ? styles.imageContainerEven : {}]}
                    style={styles.image}
                    parallaxFactor={0.35}
                    showSpinner={true}
                    spinnerColor={even ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.25)'}
                    {...parallaxProps}
                />
            </DoubleClickButton>
        ) : (
            <TouchableWithoutFeedback onPress={() => this.props.onExpand(expanded)} style={[styles.imageContainer, even ? styles.imageContainerEven : {}]}>
                <Image
                    source={{ uri: `${url}/${path}` }}
                    style={styles.image}
                />
            </TouchableWithoutFeedback>
        )
    }
    render () {
        const { data: {  path }, expanded } = this.props;
        const { width: viewportWidth} = Dimensions.get('window');
        return (
            <View style={[expanded ? {flex: 1, paddingBottom: 45} : styles.slideInnerContainer]}>
                <View style={styles.shadow} />
                {/*<TouchableOpacity onPress={() => this.props.onExpand(expanded)} style={{position: 'absolute', top: 20, right: 20, zIndex: 5}}>*/}
                {/*    {*/}
                {/*        expanded ? (*/}
                {/*            <Icon name={Platform.OS === 'ios' ? 'ios-contract' : 'md-contract'} size={24} color={COLORS.PRIMARY}/>*/}
                {/*        ) : (*/}
                {/*            <Icon name={Platform.OS === 'ios' ? 'ios-expand' : 'md-expand'} size={24} color={COLORS.PRIMARY}/>*/}
                {/*        )*/}
                {/*    }*/}
                {/*</TouchableOpacity>*/}
                {this.renderImage()}
                <View style={[expanded ? {...styles.radiusMask, left: 0, right: 0, maxWidth: viewportWidth} : styles.radiusMask]}>
                    <TouchableOpacity onPress={() => this.props.onDelete(path)} style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10, paddingVertical: 10, flex: 1}}>
                        <Text style={{color: COLORS.SECONDARY}}>DELETE</Text>
                        <Icon name={Platform.OS === 'ios' ? 'ios-trash' : 'md-trash'} size={24} color={COLORS.SECONDARY}/>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}