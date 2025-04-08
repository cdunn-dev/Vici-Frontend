import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen from '../screens/main/HomeScreen';
import TrainingScreen from '../screens/main/TrainingScreen';
import ActivityScreen from '../screens/main/ActivityScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

export type MainTabParamList = {
  Home: undefined;
  Training: undefined;
  Activity: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#5224EF',
        tabBarInactiveTintColor: '#A0A0A0',
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{
          tabBarLabel: 'Home',
          // We'll add icons later
        }}
      />
      <Tab.Screen 
        name="Training" 
        component={TrainingScreen} 
        options={{
          tabBarLabel: 'Training',
        }}
      />
      <Tab.Screen 
        name="Activity" 
        component={ActivityScreen} 
        options={{
          tabBarLabel: 'Activity',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
} 