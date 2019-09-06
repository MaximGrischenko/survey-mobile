import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
} from 'react-native';
import {CirclesLoader} from 'react-native-indicator';
import {COLORS} from '../../styles/colors';

export const PrimaryButton = (props: any) => {
    const {
        title = 'Enter',
        disabled = false,
        style = {},
        textStyle = {},
        variant = 'primary',
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
        <TouchableOpacity
                onPress={_onPress}
                style={[
                    variant === 'secondary' ? styles.button_scn : styles.button,
                    style,
                    disabled ? styles.disabled : null
                ]}>
            <Text style={[variant === 'secondary' ? styles.text_scn : styles.text, textStyle]}>
            {title}
            </Text>
            {/*{*/}
                {/*disabled ? <CirclesLoader/> : null*/}
            {/*}*/}
        </TouchableOpacity>
    )
};

const styles = StyleSheet.create({
    button: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: 50,
        minWidth: 50,
        backgroundColor: COLORS.PRIMARY,
        shadowColor: COLORS.PRIMARY,
        shadowOpacity: 0.4,
        shadowOffset: {height: 10, width: 0},
        shadowRadius: 20
    },
    button_scn: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: 50,
        minWidth: 50,
        backgroundColor: COLORS.BACKGROUND,
        shadowColor: COLORS.SECONDARY,
        shadowOpacity: 0.4,
        shadowOffset: {height: 10, width: 0},
        shadowRadius: 20
    },
    disabled: {
        opacity: 0.5
    },
    text: {
        fontSize: 16,
        textTransform: 'uppercase',
        color: COLORS.SECONDARY,
    },
    text_scn: {
        fontSize: 16,
        //textTransform: 'uppercase',
        color: COLORS.PRIMARY
    }
});