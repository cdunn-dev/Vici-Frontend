import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import WorkoutScreen from '../screens/WorkoutScreen';
import LoadingScreen from '../components/LoadingScreen';
import { theme } from '../utils/theme';
import linking from './linking';
import { useAuth } from '../hooks/useAuth';
import ComponentsExample from '../screens/ComponentsExample';

export type RootStackParamList = {
  Home: undefined;
  Onboarding: undefined;
  Workout: { id: string };
  Components: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.background,
          },
          headerTintColor: theme.colors.text,
          headerTitleStyle: {
            ...theme.typography.h2,
          },
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen
            name="Onboarding"
            component={OnboardingScreen}
            options={{ title: 'Get Started' }}
          />
        ) : (
          <>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ title: 'Vici' }}
            />
            <Stack.Screen
              name="Workout"
              component={WorkoutScreen}
              options={{ title: 'Today\'s Workout' }}
            />
          </>
        )}
        <Stack.Screen 
          name="Components" 
          component={ComponentsExample}
          options={{
            title: 'Component Library',
            headerStyle: {
              backgroundColor: '#f5f5f5',
            },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 