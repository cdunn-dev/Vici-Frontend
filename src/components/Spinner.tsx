import React from 'react';
import { View, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { theme } from '../utils/theme';

interface SpinnerProps {
  size?: 'small' | 'large';
  color?: keyof typeof theme.colors;
  style?: ViewStyle;
}

const Spinner = ({ size = 'small', color = 'primary', style }: SpinnerProps) => {
  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator
        size={size}
        color={theme.colors[color]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Spinner; 