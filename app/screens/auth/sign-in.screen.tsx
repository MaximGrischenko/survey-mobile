import React from 'react';
import {bindActionCreators} from "redux";
import {connect} from 'react-redux';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import {Form, Field} from 'react-native-validate-form';
import {NavigationParams, NavigationScreenProp, NavigationState} from "react-navigation";
import {Image} from 'react-native-elements';
import {email, InputField, required} from "../../components/inputs/field.input";
import {SecondaryButton} from "../../components/buttons/secondary.button";
import {PrimaryButton} from "../../components/buttons/primary.button";
import {moduleName, userSelector, signIn, changeSettings} from '../../redux/modules/auth';
import images from '../../styles/images';

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
        title: 'Sign In',
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
        console.log('Sign In');
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
        this.props.changeSettings({});
        this.setState({
            ...state,
            errors: []
        })
    };

    render() {
        const {authError} = this.props;
        const buttonTitle = 'Sign in';

        return (
            <View>
                <View>
                    <Image
                        source={images.Logo}
                        PlaceholderContent={<ActivityIndicator/>}
                    />
                </View>
                <View>
                    <Text>Welcome</Text>
                    <Form
                        ref={(ref) => this.SignInForm = ref}
                        validate={true}
                        errors={this.state.errors}
                    >
                        <Field
                            required
                            placeholder='Enter email'
                            component={InputField}
                            validations={[required, email]}
                            name='email'
                            value={this.state.email}
                            onChangeText={(email) => this.onChange({email})}
                        />
                        <Field
                            required
                            secureTextEntry={true}
                            placeholder='Enter password'
                            component={InputField}
                            validations={[required]}
                            name='password'
                            onChangeText={(password) => this.onChange({password})}
                        />

                        <View>
                            <SecondaryButton
                                title={'Forgot password?'}
                                onPress={this.onForgotPsw}
                            />
                        </View>
                        <PrimaryButton
                            style={{width: '100%'}}
                            title={buttonTitle}
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
                    </Form>
                </View>
            </View>
        )
    }
}

const mapStateToProps = (state: any) => ({
    user: userSelector(state),
    authError: state[moduleName].error,
    loading: state[moduleName].loading,
});

const mapDispatchToProps = (dispatch: any) => (
    bindActionCreators({
        changeSettings,
        signIn}, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(SignInScreen);