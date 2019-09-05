import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {moduleName, loadUser, userSelector, applyHeader} from '../../redux/modules/auth';
import {
    ActivityIndicator,
    AsyncStorage,
    StatusBar,
    View,
    StyleSheet
} from 'react-native';

interface IMapProps {
    isChecked: boolean,
    loading: boolean,
    user: any,
    loadUser: Function,
    navigation: any
}

class AuthLoadingScreen extends Component<IMapProps> {
    // static defaultProps = {
    //     navigation: () => 1
    // };

    constructor(props) {
        super(props);
        this._bootstrapAsync();
    }

    componentWillReceiveProps(nextProps: Readonly<IMapProps>, nextContext: any): void {
        if(nextProps.isChecked && nextProps.isChecked !== this.props.isChecked) {
            this.props.navigation.navigate(nextProps.user ? 'App' : 'Auth');
        }
    }

    // componentDidUpdate(): void {
    //     console.log('in updated');
    //     this.props.navigation.navigate(this.props.user ? 'App' : 'Auth');
    // }

    _bootstrapAsync = async () => {
       // const token = await AsyncStorage.getItem('access_token');
       // await applyHeader(token);
        this.props.loadUser();
    };

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