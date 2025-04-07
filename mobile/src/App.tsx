import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider } from 'react-redux';
import { store } from './store';

// Placeholder screens
const HomeScreen = () => null;
const TrainingPlanScreen = () => null;
const ActivitiesScreen = () => null;
const AnalyticsScreen = () => null;
const ProfileScreen = () => null;

const Tab = createBottomTabNavigator();

const App = () => {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Tab.Navigator>
          <Tab.Screen name="Home" component={HomeScreen} />
          <Tab.Screen name="Training Plan" component={TrainingPlanScreen} />
          <Tab.Screen name="Activities" component={ActivitiesScreen} />
          <Tab.Screen name="Analytics" component={AnalyticsScreen} />
          <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </Provider>
  );
};

export default App; 