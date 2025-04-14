import React from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from "@/theme/useTheme";
import { Text } from '../Text';

export interface FormErrorProps {
  error: string;
  style?: any;
  testID?: string;
}

export const FormError: React.FC<FormErrorProps> = ({
  error,
  style,
  testID = 'form-error',
}) => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    error: {
      color: theme.colors.error,
      fontSize: 12,
      marginTop: 4,
      ...style,
    },
  });

  return (
    <Text style={styles.error} testID={testID}>
      {error}
    </Text>
  );
}; 