import React from 'react';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';

import HeaderComponent from "../components/header.component";
import MainApp from './drawer.navigator';
import SignInScreen from '../screens/auth/sign-in.screen';
import ForgotPswScreen from '../screens/auth/forgot-psw.screen';
import AuthLoadingScreen from '../screens/auth/auth-loading.screen';

const AppStack = createStackNavigator({
   MainApp: {
       screen: MainApp,
       navigationOptions: ({navigation}) => ({
           header: (
               <HeaderComponent navigation={navigation}/>
           )
       })
   }
});

const AuthStack = createStackNavigator({
    SignIn: SignInScreen,
    ForgotPsw: ForgotPswScreen
});

export default createAppContainer(
    createSwitchNavigator(
        {
            AuthLoading: AuthLoadingScreen,
            App: AppStack,
            Auth: AuthStack
        },
        {
            initialRouteName: 'AuthLoading'
        }
    )
);