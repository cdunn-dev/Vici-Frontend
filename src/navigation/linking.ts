import { LinkingOptions } from '@react-navigation/native';
import { RootStackParamList } from './AppNavigator';
import { Linking, AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['vici://', 'https://vici.app'],
  config: {
    screens: {
      Home: 'home',
      Onboarding: 'onboarding',
      Workout: 'workout/:id',
    },
  },
  async getInitialURL() {
    // Check if app was opened from a deep link
    const url = await Linking.getInitialURL();
    if (url != null) {
      return url;
    }

    // Check if there is an initial state
    const isStateRestored = await AsyncStorage.getItem('navState');
    if (isStateRestored) {
      return isStateRestored;
    }

    return null;
  },
  subscribe(listener: (url: string) => void) {
    // Listen to incoming links from deep linking
    const linkingSubscription = Linking.addEventListener('url', ({ url }) => {
      listener(url);
    });

    // Listen to app state changes
    const subscription = AppState.addEventListener('change', (state: string) => {
      if (state === 'active') {
        Linking.getInitialURL().then((url) => {
          if (url) {
            listener(url);
          }
        });
      }
    });

    return () => {
      // Clean up the event listeners
      linkingSubscription.remove();
      subscription.remove();
    };
  },
};

export default linking; 