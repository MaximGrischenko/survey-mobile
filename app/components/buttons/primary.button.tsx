import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet, View,
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
                activeOpacity={disabled ? 1 : 0.7}
                onPress= {_onPress}
                style={[
                    variant === 'secondary' ? localStyles.button_scn : localStyles.button,
                    style,
                ]}>
                <Text style={[variant === 'secondary' ? localStyles.text_scn : localStyles.text, textStyle]}>
                    {title}
                </Text>
                <View style={localStyles.loader}>
                    {
                        disabled ? <CirclesLoader size={20} dotRadius={4}/> : null
                    }
                </View>
        </TouchableOpacity>
    )
};

const localStyles = StyleSheet.create({
    button: {
        // position: 'relative',
        display: 'flex',
        flexDirection: 'row',
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
       // position: 'relative',
        display: 'flex',
        flexDirection: 'row',
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
    text: {
        fontSize: 16,
        textTransform: 'uppercase',
        color: COLORS.SECONDARY,
    },
    text_scn: {
        fontSize: 16,
        color: COLORS.PRIMARY
    },
    loader: {
        position: 'absolute',
        right: 10
    }
});