import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from "@/theme/useTheme";
import { Text } from '../Text';

export interface FormGroupProps {
  label?: string;
  children: React.ReactNode;
  style?: any;
  testID?: string;
}

export const FormGroup: React.FC<FormGroupProps> = ({
  label,
  children,
  style,
  testID = 'form-group',
}) => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      marginBottom: 24,
      ...style,
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 12,
    },
  });

  return (
    <View style={styles.container} testID={testID}>
      {label && <Text style={styles.label}>{label}</Text>}
      {children}
    </View>
  );
}; 