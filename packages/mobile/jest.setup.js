import '@testing-library/jest-native/extend-expect';

// Mock React Native's Animated API
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock React Native's AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock React Native's Linking
jest.mock('react-native/Libraries/Linking/Linking', () => ({
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  openURL: jest.fn(),
  canOpenURL: jest.fn(),
  getInitialURL: jest.fn(),
}));

// Mock React Native's Platform
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'ios',
  select: jest.fn(dict => dict.ios),
})); 