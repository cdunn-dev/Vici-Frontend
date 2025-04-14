import React from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from "@/theme/useTheme";
import { Text } from '../Text';

export interface FormHelperTextProps {
  text: string;
  style?: any;
  testID?: string;
}

export const FormHelperText: React.FC<FormHelperTextProps> = ({
  text,
  style,
  testID = 'form-helper-text',
}) => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    helperText: {
      color: theme.colors.text,
      fontSize: 12,
      marginTop: 4,
      opacity: 0.7,
      ...style,
    },
  });

  return (
    <Text style={styles.helperText} testID={testID}>
      {text}
    </Text>
  );
}; 