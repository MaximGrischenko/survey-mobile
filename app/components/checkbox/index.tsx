import React from 'react'
import Icon from 'react-native-vector-icons/MaterialIcons'


import {TouchableOpacity, StyleSheet} from 'react-native'

const CheckBox = ({selected = false, onPress = (): any => 1, style=null, textStyle=null, size = 30, color = '#211f30', text = null, ...props}) => (
    <TouchableOpacity style={[localStyles.checkBox, style]} onPress={onPress} {...props}>
        <Icon
            size={size}
            color={color}
            name={selected ? 'check-box' : 'check-box-outline-blank'}
        />
        {text}
    </TouchableOpacity>
);

const localStyles = StyleSheet.create({
   checkBox: {
       flexDirection: 'row',
       alignItems: 'center',
   }
});

export default CheckBox