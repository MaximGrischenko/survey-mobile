import React from 'react';
import {bindActionCreators} from "redux";
import {connect} from 'react-redux';
import {ActivityIndicator, Dimensions, StyleSheet, Text, View} from 'react-native';
import {Form, Field} from 'react-native-validate-form';
import {NavigationParams, NavigationScreenProp, NavigationState} from "react-navigation";
import {Image} from 'react-native-elements';
import {email, required} from "../../utils/validators";
import { TextField } from 'react-native-material-textfield';
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
    formErrors: Array<any>,
    fieldError: any,
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
        formErrors: [],
        fieldError: {},
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
        this.props.navigation.navigate('ForgotPsw');
    };

    private submitForm = () => {
        let result = this.SignInForm.validate();
        let formErrors = [];
        const fieldError = {};

        result.map((field) => {
            formErrors.push({name: field.fieldName, error: field.error});
        });

        formErrors.forEach((field) => {
            fieldError[field.name] = field.error;
        });

        this.setState({
            formErrors,
            fieldError
        });
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
                <Text style={localStyles.title}>Witaj</Text>
                <Form
                    style={localStyles.form}
                    ref={(ref) => this.SignInForm = ref}
                    validate={true}
                    submit={() => this.props.signIn(this.state)}
                    errors={this.state.formErrors}
                >
                    <Field
                        customStyle={localStyles.field}
                        required
                        label={'Email'}
                        placeholder='Wpisz email'
                        component={TextField}
                        validations={[required, email]}
                        error={this.state.fieldError['email']}
                        name='email'
                        value={this.state.email}
                        onChangeText={(email) => this.onChange({email})}
                    />

                    <Field
                        customStyle={localStyles.field}
                        required
                        label={'Hasło'}
                        secureTextEntry={true}
                        placeholder='Wpisz hasło'
                        component={TextField}
                        validations={[required]}
                        error={this.state.fieldError['password']}
                        name='password'
                        onChangeText={(password) => this.onChange({password})}
                    />
                </Form>
                <PrimaryButton
                    variant={'secondary'}
                    style={localStyles.link}
                    title={'Zapomniałeś hasła?'}
                    onPress={this.onForgotPsw}
                />
                <PrimaryButton
                    style={localStyles.controls}
                    title={'Zaloguj'}
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
        paddingTop: 20,
    },
    field: {
        width: '100%',
        marginTop: 20,
    },
    link: {
        display: 'flex',
        alignSelf: 'flex-end',
        marginRight: 10,
        marginTop: 20,
        marginBottom: 40,
        height: 20,
        maxWidth: 150,
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
