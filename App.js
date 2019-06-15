import React, { Component } from 'react'
import { createStackNavigator, createAppContainer, createDrawerNavigator, createSwitchNavigator } from 'react-navigation'
import { StyleProvider, Root } from "native-base";
import getSlideFromRightTransition from 'react-navigation-slide-from-right-transition';
import AsyncStorage from '@react-native-community/async-storage';
import firebase from 'react-native-firebase';
import getTheme from './native-base-theme/components';
import platform from './native-base-theme/variables/platform';
import routes from './navRoutes'
import SideBar from "./app/components/Nav/SideBar.js";
import Loading from './app/pages/Loading'
import Login from './app/pages/Login'
import Welcome from './app/pages/Welcome'
import SignUp from './app/pages/SignUp'
import getComponentsFromRoutes from './app/tools/getComponentsFromRoutes';

const CustomDrawerContent = props => <SideBar {...props} />

const nav = getComponentsFromRoutes(routes)
const drawerOptions = {
  initialRouteName: 'Dashboard',
  contentComponent: CustomDrawerContent
}
const AppDrawer = createDrawerNavigator(nav, drawerOptions)

const screens = {
  Welcome,
  Login,
  SignUp,
  AppDrawer
}
const stackOptions = { 
  headerMode: 'none', 
  initialRouteName: 'Welcome',
  transitionConfig: getSlideFromRightTransition
}

const AppNavigator = createStackNavigator(screens, stackOptions)

const AppSwitchNavigator = createSwitchNavigator({Loading, AppNavigator}, {initialRouteName: 'Loading', headerMode: 'None'})
const AppContainer = createAppContainer(AppSwitchNavigator)

export default class App extends Component {
  
  async componentDidMount() {
    this.checkPermission();
  }

  async checkPermission() {
    const enabled = await firebase.messaging().hasPermission();
    if (enabled) {
      this.getToken();
    } else {
      this.requestPermission();
    }
  }

  async getToken() {
    let fcmToken = await AsyncStorage.getItem('fcmToken');
    if (!fcmToken) {
      fcmToken = await firebase.messaging().getToken();
      if (fcmToken) {
        // user has a device token
        await AsyncStorage.setItem('fcmToken', fcmToken);
      }
    }
  }

  async requestPermission() {
    try {
      await firebase.messaging().requestPermission();
      // User has authorised
      this.getToken();
    } catch (error) {
      // User has rejected permissions
      console.log('permission rejected');
    }
  }

  render() {
    return (
      <StyleProvider style={getTheme(platform)}>
        <Root>
          <AppContainer />
        </Root>
      </StyleProvider>
    );
  }
}
