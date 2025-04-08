import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';

export interface DividerProps {
  color?: string;
  thickness?: number;
  margin?: number;
  style?: any;
  testID?: string;
}

export const Divider: React.FC<DividerProps> = ({
  color,
  thickness = 1,
  margin = 16,
  style,
  testID = 'divider',
}) => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    divider: {
      height: thickness,
      backgroundColor: color || theme.colors.border,
      marginVertical: margin,
      ...style,
    },
  });

  return <View style={styles.divider} testID={testID} />;
}; 