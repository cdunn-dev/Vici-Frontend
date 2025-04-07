import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export function LoadingScreen() {
  const theme = useTheme();

  return (
    <View
      testID="loading-container"
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ActivityIndicator
        testID="loading-indicator"
        size="large"
        color={theme.colors.primary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 