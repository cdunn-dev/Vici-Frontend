import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../utils/theme';

interface DividerProps {
  color?: keyof typeof theme.colors;
  thickness?: number;
  style?: ViewStyle;
}

const Divider = ({ color = 'border', thickness = 1, style }: DividerProps) => {
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors[color], height: thickness },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});

export default Divider; 