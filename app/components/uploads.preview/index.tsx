import React, { Component } from 'react';
import {View, Text, Image, TouchableOpacity, Platform} from 'react-native';
import { ParallaxImage } from 'react-native-snap-carousel';
import styles from '../../styles/carousel/SliderEntry.style';
import {API} from "../../config";
import Icon from "react-native-vector-icons/Ionicons";
import {COLORS} from "../../styles/colors";
import {PrimaryButton} from "../buttons/primary.button";

interface IMapProps {
    data: any,
    even: boolean,
    parallax: boolean,
    parallaxProps: any,
    onPress: Function,
}

export default class SliderEntry extends Component<IMapProps> {

    private renderImage () {
        const {data: {path}, even, parallax, parallaxProps} = this.props;
        return parallax ? (
            <ParallaxImage
                source={{ uri: `${API}resources/${path}` }}
                containerStyle={[styles.imageContainer, even ? styles.imageContainerEven : {}]}
                style={styles.image}
                parallaxFactor={0.35}
                showSpinner={true}
                spinnerColor={even ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.25)'}
                {...parallaxProps}
            />
        ) : (
            <Image
                source={{ uri: `${API}resources/${path}` }}
                style={styles.image}
            />
        )
    }

    render () {
        const { data: {  path }, even } = this.props; //title, subtitle,

        return (
            <View style={styles.slideInnerContainer}>
                <View style={styles.shadow} />
                <View style={[styles.imageContainer, even ? styles.imageContainerEven : {}]}>
                    {this.renderImage()}
                </View>
                <View style={styles.radiusMask}>
                    <TouchableOpacity onPress={() => this.props.onPress(path)} style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10, paddingVertical: 5, flex: 1}}>
                        <Text style={{color: COLORS.SECONDARY}}>DELETE</Text>
                        <Icon name={Platform.OS === 'ios' ? 'ios-trash' : 'md-trash'} size={24} color={COLORS.SECONDARY}/>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}