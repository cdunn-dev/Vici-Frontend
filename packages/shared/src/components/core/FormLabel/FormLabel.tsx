import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from "@/theme/useTheme";
import { Text } from '../Text';

export interface FormLabelProps {
  label: string;
  required?: boolean;
  style?: any;
  testID?: string;
}

export const FormLabel: React.FC<FormLabelProps> = ({
  label,
  required = false,
  style,
  testID = 'form-label',
}) => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      marginBottom: 4,
      ...style,
    },
    label: {
      fontSize: 14,
      color: theme.colors.text,
    },
    required: {
      color: theme.colors.error,
      marginLeft: 4,
    },
  });

  return (
    <View style={styles.container} testID={testID}>
      <Text style={styles.label}>{label}</Text>
      {required && <Text style={styles.required}>*</Text>}
    </View>
  );
}; 