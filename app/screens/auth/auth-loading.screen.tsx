import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {moduleName, loadUser, userSelector, applyHeader} from '../../redux/modules/auth';
import {
    ActivityIndicator,
    AsyncStorage,
    StatusBar,
    View,
    StyleSheet,
    Image
} from 'react-native';

// import {AppLoading} from "expo";
// import * as Font from 'expo-font';
// import { Asset } from 'expo-asset';
//
// function cacheImages(images) {
//     return images.map(image => {
//        if(typeof image === 'string') {
//            return Image.prefetch(image);
//        } else {
//            return Asset.fromModule(image).downloadAsync();
//        }
//     });
// }
//
// function cacheFonts(fonts) {
//     return fonts.map(font => Font.loadAsync(font));
// }

interface IMapProps {
    isChecked: boolean,
    loading: boolean,
    user: any,
    loadUser: Function,
    navigation: any
}



class AuthLoadingScreen extends Component<IMapProps> {
    static defaultProps = {
        navigation: () => 1
    };

    state = {
        isReady: false
    };

    constructor(props) {
        super(props);
        this.props.loadUser();

      //  this._bootstrapAsync();
    }

    componentDidUpdate(): void {
        this.props.navigation.navigate(this.props.user ? 'App' : 'Auth');
    }

    // componentWillReceiveProps(nextProps: Readonly<IMapProps>, nextContext: any): void {
    //
    //     if (nextProps.isChecked && nextProps.isChecked !== this.props.isChecked) {
    //         this.props.navigation.navigate(nextProps.user ? 'App' : 'Auth');
    //     }
    // }

    // _bootstrapAsync = async () => {
    //     // const token = await AsyncStorage.getItem('access_token');
    //     // await applyHeader(token);
    //
    // };

    render() {
        return (
            <View style={styles.container}>
                <ActivityIndicator />
                <StatusBar barStyle={"default"}/>
            </View>
        );
    }
}

const mapStateToProps = (state: any) => ({
    user: userSelector(state),
    authError: state[moduleName].error,
    isChecked: state[moduleName].isChecked,
    loading: state[moduleName].loading
});

const mapDispatchToProps =(dispatch: any) => (
    bindActionCreators({
        loadUser
    }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(AuthLoadingScreen);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});