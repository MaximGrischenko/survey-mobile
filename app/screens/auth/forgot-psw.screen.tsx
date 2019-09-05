import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {NavigationParams, NavigationScreenProp, NavigationState} from "react-navigation";
import {ActivityIndicator, Text, View} from "react-native";
import {Image} from 'react-native-elements';
import images from "../../styles/images";
import {Form, Field} from 'react-native-validate-form';
import {email, InputField, required} from "../../components/inputs/field.input";
import {SecondaryButton} from "../../components/buttons/secondary.button";
import {PrimaryButton} from "../../components/buttons/primary.button";
import {changeSettings, reqResetPsw, moduleName, userSelector} from "../../redux/modules/auth";

interface IMapProps {
    reqResetPsw: any,
    refreshed: any,
    user: any,
    loading: boolean,
    authError: any,
    signIn: Function,
    changeSettings: Function,
    navigation: NavigationScreenProp<NavigationState, NavigationParams>
}

interface IMapState {
    email: string,
    errors: Array<any>
}

class ForgotPswScreen extends Component<IMapProps, IMapState> {
    static navigationOptions = {
        title: 'Forgot Password',
    };

    private ResetPswForm: any;

    state = {
        email: '',
        errors: []
    };

    componentDidMount(): void {
        this.props.changeSettings({});
    }

    componentWillReceiveProps(nextProps: Readonly<IMapProps>, nextContext: any): void {
        if(nextProps.user !== this.props.user) {
            this.props.navigation.navigate('App');
        }
        if(nextProps.refreshed !== this.props.refreshed) {
            this.props.navigation.navigate('SignIn');
        }
    }

    private onBack = () => {
        this.props.navigation.navigate('SignIn');
    };

    private submitForm = async () => {
        let submitResult = this.ResetPswForm.validate();
        let errors = [];

        submitResult.forEach(item => {
           errors.push({field: item.fieldName, error: item.error});
        });

        this.setState({errors: errors});

        if(errors.filter((el: any) => el.error).length === 0) {
            try {
                const newState: any = {pending: true};
                this.setState(newState);
                await this.props.reqResetPsw(this.state);
            } catch {

            }
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
        return (
            <View>
                <View>
                    <Image
                        source={images.Logo}
                        PlaceholderContent={<ActivityIndicator/>}
                    />
                </View>
                <View>
                    <Text>Reset Password</Text>
                    <Form
                        ref={(ref) => this.ResetPswForm = ref}
                        validate={true}
                        errors={this.state.errors}
                    >
                        <Field
                            requered
                            placeholder='Enter email'
                            component={InputField}
                            validation={[required, email]}
                            name='email'
                            value={this.state.email}
                            onChangeText={(email) => this.onChange({email})}
                        />
                    </Form>
                </View>
                <View>
                    <SecondaryButton
                        title={'Back to Login'}
                        onPress={this.onBack}
                    />
                </View>
                <PrimaryButton
                    title={'Reset password!'}
                    disabled={this.props.loading}
                    onPress={this.submitForm}
                />
                {
                    authError ? (
                        <Text style={{color: 'red'}}>
                            User not found
                        </Text>
                    ) : null
                }
            </View>
        )
    }
}

const mapStateToProps = (state: any) => ({
    refreshed: state[moduleName].refreshed,
    user: userSelector(state),
    authError: state[moduleName].authError,
    loading: state[moduleName].loading
});

const mapDispatchToProps = (dispatch: any) => (
    bindActionCreators({
        changeSettings,
        reqResetPsw,
    }, dispatch)
);

export default connect(mapDispatchToProps, mapStateToProps)(ForgotPswScreen);