import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { navigationRef } from '../utils/NavigationService';
import NavBar from './NavBar';
import {
    CustomerForm, Customers, InvoiceForm, Invoices, ItemForm, Items,
    Login, Profile, SignUp, Splash,
} from '../pages/index';

// Fallback for native-base if it fails to load
let Root;
try {
    const NB = require('native-base');
    Root = NB.Root;
    console.log('native-base Root loaded');
} catch (e) {
    console.error('Failed to load native-base:', e);
    Root = ({children}) => children;
}

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeTabs() {
  return (
    <Tab.Navigator tabBar={props => <NavBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tab.Screen name="invoices" component={Invoices} />
      <Tab.Screen name="customers" component={Customers} />
      <Tab.Screen name="items" component={Items} />
    </Tab.Navigator>
  );
}

function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="splash" component={Splash} />
      <Stack.Screen name="home" component={HomeTabs} />
      <Stack.Screen name="customerForm" component={CustomerForm} />
      <Stack.Screen name="itemForm" component={ItemForm} />
      <Stack.Screen name="invoiceForm" component={InvoiceForm} />
      <Stack.Screen name="profile" component={Profile} />
    </Stack.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" component={Login} />
      <Stack.Screen name="signup" component={SignUp} />
    </Stack.Navigator>
  );
}

const Routes = ({ isLoggedIn }) => {
  return (
    <Root>
      <NavigationContainer ref={navigationRef}>
        {isLoggedIn ? <AppStack /> : <AuthStack />}
      </NavigationContainer>
    </Root>
  );
};

export default Routes;
