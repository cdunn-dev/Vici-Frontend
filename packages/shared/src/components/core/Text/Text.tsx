import React from 'react';
import { Text as RNText, StyleSheet, TextStyle } from 'react-native';
import { useTheme } from "@/theme/useTheme";

export interface TextProps {
  /** Text content */
  children: React.ReactNode;
  /** Text style */
  style?: TextStyle;
  /** Test ID for testing */
  testID?: string;
}

/**
 * A reusable text component that uses the theme's typography
 */
export const Text: React.FC<TextProps> = ({ children, style, testID }) => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    text: {
      color: theme.colors.text,
      fontSize: 16,
      ...style,
    },
  });

  return (
    <RNText style={styles.text} testID={testID}>
      {children}
    </RNText>
  );
}; 