import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../utils/theme';
import Text from './Text';
import Icon from './Icon';

interface AlertProps {
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  style?: ViewStyle;
}

const Alert = ({ title, message, type = 'info', style }: AlertProps) => {
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
        color={type}
        style={styles.icon}
      />
      <View style={styles.content}>
        <Text
          variant="h3"
          color={type}
          style={styles.title}
        >
          {title}
        </Text>
        <Text
          variant="body"
          color={type}
          style={styles.message}
        >
          {message}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: theme.spacing.m,
    borderRadius: theme.border.radius.md,
    margin: theme.spacing.m,
  },
  success: {
    backgroundColor: `${theme.colors.success}20`,
  },
  error: {
    backgroundColor: `${theme.colors.error}20`,
  },
  warning: {
    backgroundColor: `${theme.colors.warning}20`,
  },
  info: {
    backgroundColor: `${theme.colors.primary}20`,
  },
  icon: {
    marginRight: theme.spacing.sm,
  },
  content: {
    flex: 1,
  },
  title: {
    marginBottom: theme.spacing.xs,
  },
  message: {
    opacity: 0.8,
  },
});

export default Alert; 