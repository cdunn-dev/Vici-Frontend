import React from 'react';
import { ActivityIndicator, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from "@/theme/useTheme";

export type SpinnerSize = 'tiny' | 'small' | 'medium' | 'large' | 'xlarge' | number;

const SPINNER_SIZES = {
  tiny: 16,
  small: 24,
  medium: 32,
  large: 48,
  xlarge: 64,
};

export interface SpinnerProps {
  /** Size of the spinner */
  size?: SpinnerSize;
  /** Color of the spinner */
  color?: string;
  /** Additional styles for the container */
  style?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}

/**
 * A reusable spinner component for loading states
 */
export const Spinner: React.FC<SpinnerProps> = ({
  size = 'medium',
  color,
  style,
  testID = 'spinner',
}) => {
  const theme = useTheme();
  const spinnerSize = typeof size === 'number' ? size : SPINNER_SIZES[size];
  const spinnerColor = color || theme.colors.primary;

  const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

  return (
    <View style={[styles.container, style]} testID={testID}>
      <ActivityIndicator
        size={spinnerSize}
        color={spinnerColor}
        testID={`${testID}-indicator`}
      />
    </View>
  );
}; 