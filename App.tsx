import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as ReduxProvider } from 'react-redux';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { store } from './src/store';
import { RootStackParamList, AuthStackParamList, MainTabParamList } from './src/types/navigation';
import { ErrorBoundary } from './src/components/ErrorBoundary';

// Import screens
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import HomeScreen from './src/screens/main/HomeScreen';
import TrainingScreen from './src/screens/main/TrainingScreen';
import ProfileScreen from './src/screens/main/ProfileScreen';
import SettingsScreen from './src/screens/main/SettingsScreen';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();

const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
  </AuthStack.Navigator>
);

const MainNavigator = () => (
  <MainTab.Navigator>
    <MainTab.Screen name="Home" component={HomeScreen} />
    <MainTab.Screen name="Training" component={TrainingScreen} />
    <MainTab.Screen name="Profile" component={ProfileScreen} />
    <MainTab.Screen name="Settings" component={SettingsScreen} />
  </MainTab.Navigator>
);

function App(): React.JSX.Element {
  // For now, we'll assume the user is not authenticated
  const isAuthenticated = false;

  return (
    <ErrorBoundary>
      <ReduxProvider store={store}>
        <ThemeProvider>
          <SafeAreaProvider>
            <NavigationContainer>
              <RootStack.Navigator screenOptions={{ headerShown: false }}>
                {!isAuthenticated ? (
                  <RootStack.Screen name="Auth" component={AuthNavigator} />
                ) : (
                  <RootStack.Screen name="Main" component={MainNavigator} />
                )}
              </RootStack.Navigator>
            </NavigationContainer>
          </SafeAreaProvider>
        </ThemeProvider>
      </ReduxProvider>
    </ErrorBoundary>
  );
}

export default App; 