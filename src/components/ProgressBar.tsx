import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../utils/theme';

interface ProgressBarProps {
  progress: number;
  color?: keyof typeof theme.colors;
  height?: number;
  style?: ViewStyle;
}

const ProgressBar = ({
  progress,
  color = 'primary',
  height = 4,
  style,
}: ProgressBarProps) => {
  return (
    <View
      style={[
        styles.container,
        { height },
        style,
      ]}
    >
      <View
        style={[
          styles.progress,
          {
            width: `${Math.min(100, Math.max(0, progress))}%`,
            backgroundColor: theme.colors[color],
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: theme.colors.border,
    borderRadius: theme.border.radius.lg,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    borderRadius: theme.border.radius.lg,
  },
});

export default ProgressBar; 