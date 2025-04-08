import React from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
  Text,
} from 'react-native';
import { useTheme } from '../../../hooks/useTheme';

export interface TextAreaProps extends Omit<TextInputProps, 'style'> {
  /** Label text for the textarea */
  label?: string;
  /** Error message to display */
  error?: string;
  /** Whether the textarea is disabled */
  disabled?: boolean;
  /** Number of lines to display */
  numberOfLines?: number;
  /** Additional styles for the container */
  containerStyle?: ViewStyle;
  /** Additional styles for the input */
  inputStyle?: TextStyle;
  /** Additional styles for the label */
  labelStyle?: TextStyle;
  /** Additional styles for the error message */
  errorStyle?: TextStyle;
  /** Test ID for testing */
  testID?: string;
}

/**
 * A reusable textarea component for multi-line text input
 */
export const TextArea: React.FC<TextAreaProps> = ({
  label,
  error,
  disabled = false,
  numberOfLines = 4,
  containerStyle,
  inputStyle,
  labelStyle,
  errorStyle,
  testID = 'textarea',
  ...props
}) => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      width: '100%',
      ...containerStyle,
    },
    label: {
      color: theme.colors.text,
      fontSize: 14,
      marginBottom: 8,
      ...labelStyle,
    },
    input: {
      width: '100%',
      minHeight: 100,
      padding: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: error ? theme.colors.error : theme.colors.text + '40',
      backgroundColor: disabled ? theme.colors.text + '10' : theme.colors.background,
      color: theme.colors.text,
      fontSize: 16,
      textAlignVertical: 'top',
      ...inputStyle,
    },
    error: {
      color: theme.colors.error,
      fontSize: 12,
      marginTop: 4,
      ...errorStyle,
    },
  });

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        {...props}
        style={styles.input}
        multiline
        numberOfLines={numberOfLines}
        editable={!disabled}
        placeholderTextColor={theme.colors.text + '80'}
        testID={testID}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}; 