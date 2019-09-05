import React from 'react';
import {TextInput, Text, View} from 'react-native';
import styles from '../../styles/form/input';
import {COLORS} from '../../styles/colors';

export const InputField = (
    {
       name,
       customStyle,
       onChangeText,
       value,
       disabled,
       secureTextEntry,
       multiline,
       numberOfLines,
       placeholder,
       errors,}: any) => {
    const style = {
        ...(customStyle ? customStyle : {}),
        ...styles.input
    };

    return (
        <View>
            <TextInput
                secureTextEntry={secureTextEntry}
                value={value}
                multiline={multiline}
                numberOfLines={numberOfLines}
                onChangeText={onChangeText ? (val) => onChangeText(val) : null}
                placeholder={placeholder ? placeholder : ''}
                placeholderTextColor={COLORS.TEXT_COLOR}
                style={style}
                />

            {
                errors && errors.length > 0 && errors.map((item, index) =>
                    item.field === name && item.error ?
                        <Text style={{color: 'red'}} key={index}>{item.error}</Text> : <View key={index}/>
                )
            }
        </View>
    )
};

export const required = value => (value ? undefined: 'This is requred field');
export const email = value => value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,5}$/i.test(value) ? 'Please provide a valid email address.' : undefined;
