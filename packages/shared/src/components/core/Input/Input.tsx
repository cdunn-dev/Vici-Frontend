import React from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps as RNTextInputProps,
} from 'react-native';

export interface InputProps extends Omit<RNTextInputProps, 'style'> {
  /** Label text to display above the input */
  label?: string;
  /** Error message to display below the input */
  error?: string;
  /** Helper text to display below the input */
  helperText?: string;
  /** Whether the input is in a loading state */
  loading?: boolean;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Additional styles for the container */
  containerStyle?: ViewStyle;
  /** Additional styles for the input */
  inputStyle?: TextStyle;
  /** Additional styles for the label */
  labelStyle?: TextStyle;
  /** Additional styles for the error message */
  errorStyle?: TextStyle;
  /** Additional styles for the helper text */
  helperTextStyle?: TextStyle;
}

/**
 * A reusable input component that supports labels, error states, and helper text
 */
export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  loading,
  disabled,
  containerStyle,
  inputStyle,
  labelStyle,
  errorStyle,
  helperTextStyle,
  ...rest
}) => {
  const styles = StyleSheet.create({
    container: {
      width: '100%',
    },
    label: {
      fontSize: 14,
      fontWeight: '500',
      color: '#11182C',
      marginBottom: 4,
    },
    input: {
      height: 40,
      borderWidth: 1,
      borderColor: error ? '#DC2626' : '#E5E7EB',
      borderRadius: 8,
      paddingHorizontal: 12,
      fontSize: 16,
      color: '#11182C',
      backgroundColor: disabled ? '#F3F4F6' : '#FFFFFF',
    },
    error: {
      fontSize: 12,
      color: '#DC2626',
      marginTop: 4,
    },
    helperText: {
      fontSize: 12,
      color: '#6B7280',
      marginTop: 4,
    },
  });

  return (
    <View style={[styles.container, containerStyle]} testID="input-container">
      {label && (
        <Text style={[styles.label, labelStyle]} testID="input-label">
          {label}
        </Text>
      )}
      <TextInput
        style={[styles.input, inputStyle]}
        placeholderTextColor="#9CA3AF"
        editable={!loading && !disabled}
        {...rest}
        testID="text-input"
      />
      {error && (
        <Text style={[styles.error, errorStyle]} testID="input-error">
          {error}
        </Text>
      )}
      {helperText && !error && (
        <Text style={[styles.helperText, helperTextStyle]} testID="input-helper">
          {helperText}
        </Text>
      )}
    </View>
  );
}; 