import React from 'react';
import {bindActionCreators} from "redux";
import {connect} from 'react-redux';
import {ActivityIndicator, Dimensions, StyleSheet, Text, View} from 'react-native';
import {Form, Field} from 'react-native-validate-form';
import {NavigationParams, NavigationScreenProp, NavigationState} from "react-navigation";
import {Image} from 'react-native-elements';
import {email, InputField, required} from "../../components/inputs/field.input";
import {PrimaryButton} from "../../components/buttons/primary.button";
import {moduleName, userSelector, signIn, changeSettings} from '../../redux/modules/auth';
import {COLORS} from "../../styles/colors";

interface IMapProps {
    user: any,
    loading: any,
    authError: any,
    changeSettings: Function,
    signIn: Function,
    navigation: NavigationScreenProp<NavigationState, NavigationParams>
}

interface IMapState {
    email: string,
    password: string,
    errors: Array<any>
}

class SignInScreen extends React.Component<IMapProps, IMapState> {
    static navigationOptions = {
        header:
            <View style={{
                position: 'absolute',
                top: 45,
                height: 60,
                width: Dimensions.get('window').width - 20,
                backgroundColor: 'f2f2f2',
                display: 'flex',
                flexDirection: 'row',
                alignSelf: 'center',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <Image
                    style={{height: 35, width: 270}}
                    source={require('../../../assets/images/logo.png')}
                    PlaceholderContent={<ActivityIndicator/>}
                />
            </View>
    };

    private SignInForm: any;

    state = {
        pending: false,
        email: '',
        password: '',
        errors: [],
    };

    componentDidMount():void {
        this.props.changeSettings({});
    }

    componentWillReceiveProps(nextProps: Readonly<IMapProps>, nextContext: any): void {
        if(nextProps.user !== this.props.user) {
            this.props.navigation.navigate('App');
        }
    }

    private onForgotPsw = () => {
        this.props.navigation.navigate('ForgotPsw')
    };

    private submitForm = () => {
        let submitResult = this.SignInForm.validate();
        let errors = [];

        submitResult.forEach(item => {
            errors.push({field: item.fieldName, error: item.error});
        });

        this.setState({errors: errors});

        if(errors.filter((el: any) => el.error).length === 0) {
            const newState: any = {pending: true};
            this.setState(newState);
            this.props.signIn(this.state);
        }
    };

    private onChange = (state) => {
        // this.props.changeSettings({});
        this.setState({
            ...state,
            errors: []
        })
    };

    render() {
        const {authError} = this.props;
        return (
            <View style={localStyles.container}>
                <Text style={localStyles.title}>Welcome</Text>
                <Form
                    style={localStyles.form}
                    ref={(ref) => this.SignInForm = ref}
                    validate={true}
                    errors={this.state.errors}
                >
                    <Field
                        style={localStyles.field}
                        required
                        placeholder='Enter email'
                        component={InputField}
                        validations={[required, email]}
                        name='email'
                        value={this.state.email}
                        onChangeText={(email) => this.onChange({email})}
                    />
                    <Field
                        style={localStyles.field}
                        required
                        secureTextEntry={true}
                        placeholder='Enter password'
                        component={InputField}
                        validations={[required]}
                        name='password'
                        onChangeText={(password) => this.onChange({password})}
                    />
                </Form>
                <View style={localStyles.link}>
                    <PrimaryButton
                        variant={'secondary'}
                        style={localStyles.controls}
                        textStyle={{display:'flex', alignSelf: 'flex-end'}}
                        title={'Forgot password?'}
                        disabled={this.props.loading}
                        onPress={this.submitForm}
                    />
                </View>
                <PrimaryButton
                    style={localStyles.controls}
                    title={'Sign in'}
                    disabled={this.props.loading}
                    onPress={this.submitForm}
                />
                {
                    authError ? (
                        <Text style={{color: 'red'}}>
                            Error! Either email or password are wrong. Please try again
                        </Text>
                    ) : null
                }
            </View>
        )
    }
}

const localStyles = StyleSheet.create({
    container: {
        display: 'flex',
        flex: 1,
        alignItems: 'center',
        backgroundColor: COLORS.BACKGROUND
    },
    title: {
        marginTop: 130,
        fontSize: 20,
        fontWeight: 'bold'
    },
    form: {
        width: Dimensions.get('window').width - 20,
        paddingTop: 30,
        paddingBottom: 10,
    },
    field: {
        width: '100%',
        marginTop: 10,
        marginBottom: 10,
    },
    link: {
        marginBottom: 40,
    },
    controls: {
        width: Dimensions.get('window').width - 20,
    }
});

const mapStateToProps = (state: any) => ({
    user: userSelector(state),
    authError: state[moduleName].error,
    loading: state[moduleName].loading,
});

const mapDispatchToProps = (dispatch: any) => (
    bindActionCreators({
        changeSettings,
        signIn
    }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(SignInScreen);
