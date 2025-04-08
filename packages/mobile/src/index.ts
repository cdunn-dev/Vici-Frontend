import App from './App';

// Export the main app component
export default App;

// Export screens for potential use in shared components
export * from './screens/auth/LoginScreen';
export * from './screens/auth/RegisterScreen';
export * from './screens/auth/ForgotPasswordScreen';

// Export navigation types
export * from './navigation/RootNavigator';
export * from './navigation/AuthNavigator';
export * from './navigation/MainNavigator'; 