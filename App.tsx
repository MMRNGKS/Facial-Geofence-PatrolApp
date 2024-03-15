/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import * as React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import LoginScreen from './screens/LogIn';
import HomeScreen from './screens/Home';
import SplashScreen1 from './screens/SplashScreen1';
import DataSentSuccessScreen from './screens/DataSentSuccess';

const Stack = createNativeStackNavigator();

const MyStack = () => {
  const [hideSplashScreen, setHideSplashScreen] = React.useState(false);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  React.useEffect(() => {
    setTimeout(() => {
      setHideSplashScreen(true);
    }, 2000);

    const onLogin = async () => {
      try {
        const savedUser = await AsyncStorage.getItem('user');
        if (savedUser !== null) {
          setIsAuthenticated(true);
          console.log('Auto navigate to Home');
        } else {
          console.log('No user data yet.');
        }
      } catch (error) {
        console.error(error);
      }
    };

    onLogin();
  }, []);

  const onLogin = async () => {
    try {
      const savedUser = await AsyncStorage.getItem('user');
      if (savedUser !== null) {
        setIsAuthenticated(true);
        console.log('Authenticated');
      } else {
        setIsAuthenticated(false);
        console.log('Not Authenticated.');
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <NavigationContainer>
      {hideSplashScreen ? (
        isAuthenticated ? (
          <Stack.Navigator>
            <Stack.Screen name="Home" options={{headerShown: false}}>
              {props => <HomeScreen {...props} onLogin={onLogin} />}
            </Stack.Screen>
            <Stack.Screen
              name="DataSentSuccess"
              component={DataSentSuccessScreen}
              options={{headerShown: false}}
            />
          </Stack.Navigator>
        ) : (
          <Stack.Navigator>
            <Stack.Screen
              name="LogIn"
              options={{headerShown: false, animation: 'none'}}>
              {props => <LoginScreen {...props} onLogin={onLogin} />}
            </Stack.Screen>
          </Stack.Navigator>
        )
      ) : (
        <SplashScreen1 />
      )}
    </NavigationContainer>
  );
};

export default MyStack;
