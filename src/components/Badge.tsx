import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../utils/theme';
import Text from './Text';

interface BadgeProps {
  variant?: 'primary' | 'secondary' | 'success' | 'error' | 'warning';
  children: React.ReactNode;
  style?: ViewStyle;
}

const Badge = ({ variant = 'primary', children, style }: BadgeProps) => {
  return (
    <View
      style={[
        styles.badge,
        variant === 'primary' && styles.primaryBadge,
        variant === 'secondary' && styles.secondaryBadge,
        variant === 'success' && styles.successBadge,
        variant === 'error' && styles.errorBadge,
        variant === 'warning' && styles.warningBadge,
        style,
      ]}
    >
      <Text
        variant="caption"
        color={
          variant === 'primary' || variant === 'secondary'
            ? 'white'
            : 'text'
        }
      >
        {children}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    alignSelf: 'flex-start',
  },
  primaryBadge: {
    backgroundColor: theme.colors.primary,
  },
  secondaryBadge: {
    backgroundColor: theme.colors.secondary,
  },
  successBadge: {
    backgroundColor: theme.colors.success,
  },
  errorBadge: {
    backgroundColor: theme.colors.error,
  },
  warningBadge: {
    backgroundColor: theme.colors.warning,
  },
});

export default Badge; 