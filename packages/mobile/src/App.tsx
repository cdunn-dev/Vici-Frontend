import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as ReduxProvider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'react-native';

import RootNavigator from './navigation/RootNavigator';
import { store } from './store';

export default function App() {
  return (
    <ReduxProvider store={store}>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar barStyle="dark-content" />
          <RootNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </ReduxProvider>
  );
} 