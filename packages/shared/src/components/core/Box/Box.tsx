import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';

export interface BoxProps {
  children: React.ReactNode;
  padding?: number;
  margin?: number;
  width?: number | string;
  height?: number | string;
  backgroundColor?: string;
  borderRadius?: number;
  style?: any;
  testID?: string;
}

export const Box: React.FC<BoxProps> = ({
  children,
  padding = 0,
  margin = 0,
  width,
  height,
  backgroundColor,
  borderRadius = 0,
  style,
  testID = 'box',
}) => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      padding,
      margin,
      width,
      height,
      backgroundColor: backgroundColor || theme.colors.background,
      borderRadius,
      ...style,
    },
  });

  return (
    <View style={styles.container} testID={testID}>
      {children}
    </View>
  );
}; 