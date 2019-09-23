import React from 'react';
import {
    TouchableOpacity,
    Platform,
    StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {COLORS} from '../../styles/colors';

export const FabButton = (props: any) => {
    const {
        disabled = false,
        style = {},
        onPress
    } = props;

    const _onPress = (e) => {
        if(disabled) {
            return
        } else {
            onPress(e);
        }
    };

    return (
        <TouchableOpacity onPress={_onPress} style={[styles.button, style, disabled ? styles.disabled : null]}>
            <Icon size={24} style={styles.icon} name={Platform.OS === 'ios' ? 'ios-add' : 'md-add'}/>
        </TouchableOpacity>
    )
};

const styles = StyleSheet.create({
    button: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: 50,
        width: 50,
        borderRadius: 100,
        backgroundColor: COLORS.PRIMARY,
        shadowColor: COLORS.PRIMARY,
        shadowOpacity: 0.4,
        shadowOffset: {height: 10, width: 0},
        shadowRadius: 20
    },
    disabled: {
        opacity: 0.5
    },
    icon: {
        color: COLORS.SECONDARY,
        height: 24,
    }
});