import React, {Component} from 'react';
import {
    StyleSheet,
    View,
    TouchableOpacity,
    Platform, Dimensions, Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { DrawerActions } from 'react-navigation-drawer';
import images from '../../styles/images';

interface IHeaderProps {
    navigation: any,
}

class HeaderComponent extends Component<IHeaderProps> {
    render() {
        const {navigation} = this.props;
        const isDrawerOpen = navigation.state.isDrawerOpen;
        return (
            <View style={localStyles.container}>
                {
                    isDrawerOpen ? (
                        <View style={localStyles.header}>
                            <Image source={images.Logo}/>
                            <TouchableOpacity onPress={() => {navigation.dispatch(DrawerActions.toggleDrawer())}}>
                                <Icon name={Platform.OS === 'ios' ? 'ios-close' : 'md-close'} size={30} />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={localStyles.header}>
                            <TouchableOpacity onPress={() => {navigation.dispatch(DrawerActions.toggleDrawer())}}>
                                <Icon name={Platform.OS === 'ios' ? 'ios-menu' : 'md-menu'} size={30} />
                            </TouchableOpacity>
                        </View>
                    )
                }
            </View>
        )
    }
}

export default HeaderComponent;

const localStyles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 45,
        height: 60,
        width: Dimensions.get('window').width - 20,
        backgroundColor: '#3e3e3e',
        display: 'flex',
        flexDirection: 'row',
        alignSelf: 'center',
        alignItems: 'center',
    },
    header: {
        display: 'flex',
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: 10,
        paddingRight: 10,
    }
});