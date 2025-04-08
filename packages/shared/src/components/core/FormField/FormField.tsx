import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { Text } from '../Text';

export interface FormFieldProps {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  children: React.ReactNode;
  style?: any;
  testID?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  helperText,
  required = false,
  children,
  style,
  testID = 'form-field',
}) => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      marginBottom: 16,
      ...style,
    },
    labelContainer: {
      flexDirection: 'row',
      marginBottom: 4,
    },
    label: {
      fontSize: 14,
      color: theme.colors.text,
      marginBottom: 4,
    },
    required: {
      color: theme.colors.error,
      marginLeft: 4,
    },
    error: {
      color: theme.colors.error,
      fontSize: 12,
      marginTop: 4,
    },
    helperText: {
      color: theme.colors.textSecondary,
      fontSize: 12,
      marginTop: 4,
    },
  });

  return (
    <View style={styles.container} testID={testID}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>{label}</Text>
          {required && <Text style={styles.required}>*</Text>}
        </View>
      )}
      {children}
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
}; 