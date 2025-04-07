import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../utils/theme';
import Text from './Text';
import Icon from './Icon';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  style?: ViewStyle;
}

const Toast = ({ message, type = 'info', style }: ToastProps) => {
  const getIconName = () => {
    switch (type) {
      case 'success':
        return 'check-circle';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
    }
  };

  return (
    <View
      style={[
        styles.container,
        styles[type],
        style,
      ]}
    >
      <Icon
        name={getIconName()}
        size={24}
        color="background"
        style={styles.icon}
      />
      <Text
        variant="body"
        color="background"
        style={styles.text}
      >
        {message}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.m,
    borderRadius: theme.border.radius.md,
    margin: theme.spacing.m,
  },
  success: {
    backgroundColor: theme.colors.success,
  },
  error: {
    backgroundColor: theme.colors.error,
  },
  warning: {
    backgroundColor: theme.colors.warning,
  },
  info: {
    backgroundColor: theme.colors.primary,
  },
  icon: {
    marginRight: theme.spacing.sm,
  },
  text: {
    flex: 1,
  },
});

export default Toast; 