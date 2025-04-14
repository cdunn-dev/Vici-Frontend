import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';

export interface ButtonProps {
  /** The text to display inside the button */
  title?: string;
  /** Function to call when button is pressed */
  onPress: () => void;
  /** Visual variant of the button */
  variant?: 'primary' | 'secondary' | 'outline';
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Whether to show a loading indicator */
  loading?: boolean;
  /** Additional styles for the button container */
  style?: ViewStyle;
  /** Additional styles for the button text */
  textStyle?: TextStyle;
  /** Children elements */
  children?: React.ReactNode;
  /** Test ID for testing */
  testID?: string;
}

/**
 * A reusable button component that supports different variants and states
 */
export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
  children,
  testID,
}) => {
  const styles = StyleSheet.create({
    button: {
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: variant === 'primary' ? '#5224EF' : 'transparent',
      borderWidth: variant === 'outline' ? 1 : 0,
      borderColor: '#5224EF',
      opacity: disabled ? 0.5 : 1,
    },
    text: {
      color: variant === 'primary' ? '#FFFFFF' : '#5224EF',
      fontSize: 16,
      fontWeight: '600',
    },
  });

  const buttonContent = title || children;

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator 
          testID="loading-indicator"
          color={variant === 'primary' ? '#FFFFFF' : '#5224EF'} 
        />
      ) : typeof buttonContent === 'string' ? (
        <Text style={[styles.text, textStyle]}>{buttonContent}</Text>
      ) : (
        buttonContent
      )}
    </TouchableOpacity>
  );
}; 