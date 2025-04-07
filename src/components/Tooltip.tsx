import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../utils/theme';
import Text from './Text';

interface TooltipProps {
  text: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  style?: ViewStyle;
}

const Tooltip = ({ text, position = 'top', style }: TooltipProps) => {
  return (
    <View
      style={[
        styles.container,
        styles[position],
        style,
      ]}
    >
      <View style={styles.tooltip}>
        <Text
          variant="caption"
          color="background"
          style={styles.text}
        >
          {text}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
  },
  tooltip: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.sm,
    borderRadius: theme.border.radius.md,
  },
  text: {
    textAlign: 'center',
  },
  top: {
    bottom: theme.spacing.m,
  },
  bottom: {
    top: theme.spacing.m,
  },
  left: {
    right: theme.spacing.m,
  },
  right: {
    left: theme.spacing.m,
  },
});

export default Tooltip; 