import React from 'react';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import DrawerNavigator from './drawer.navigator';
import SignInScreen from '../screens/auth/sign-in.screen';
import ForgotPswScreen from '../screens/auth/forgot-psw.screen';
import AuthLoadingScreen from '../screens/auth/auth-loading.screen';
import TabNavigator from "./tabbar.navigator";
import TablesHeader from "../components/tables.header";
import AppHeader from "../components/app.header";


const AppStack = createStackNavigator({
   Main: {
       screen: DrawerNavigator,
       navigationOptions: ({navigation}): { header: any } => ({
           header: (
               <AppHeader navigation={navigation}/>
           )
       })
   },
    Tables: {
        screen: TabNavigator,
        navigationOptions: ({navigation}): { header: any } => ({
            header: (
                <TablesHeader navigation={navigation} />
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