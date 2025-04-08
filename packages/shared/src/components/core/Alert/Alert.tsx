import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { Icon } from '../Icon';

export type AlertType = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps {
  type?: AlertType;
  title?: string;
  message: string;
  icon?: string;
  showIcon?: boolean;
  showClose?: boolean;
  onClose?: () => void;
  actions?: {
    label: string;
    onPress: () => void;
    type?: 'primary' | 'secondary' | 'text';
  }[];
  style?: ViewStyle;
}

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  message,
  icon,
  showIcon = true,
  showClose = false,
  onClose,
  actions,
  style,
}) => {
  const theme = useTheme();

  const getAlertStyles = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: theme.colors.success + '10',
          borderColor: theme.colors.success,
          iconColor: theme.colors.success,
        };
      case 'warning':
        return {
          backgroundColor: theme.colors.warning + '10',
          borderColor: theme.colors.warning,
          iconColor: theme.colors.warning,
        };
      case 'error':
        return {
          backgroundColor: theme.colors.error + '10',
          borderColor: theme.colors.error,
          iconColor: theme.colors.error,
        };
      default:
        return {
          backgroundColor: theme.colors.primary + '10',
          borderColor: theme.colors.primary,
          iconColor: theme.colors.primary,
        };
    }
  };

  const getDefaultIcon = () => {
    switch (type) {
      case 'success':
        return 'check-circle';
      case 'warning':
        return 'alert-triangle';
      case 'error':
        return 'x-circle';
      default:
        return 'info';
    }
  };

  const alertStyles = getAlertStyles();
  const defaultIcon = getDefaultIcon();

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: alertStyles.borderColor,
      backgroundColor: alertStyles.backgroundColor,
      ...style,
    },
    content: {
      flex: 1,
      marginRight: showClose ? theme.spacing.sm : 0,
    },
    title: {
      fontSize: theme.typography.fontSize.bodyLarge,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: title ? theme.spacing.xs : 0,
    },
    message: {
      fontSize: theme.typography.fontSize.bodyMedium,
      color: theme.colors.text,
      lineHeight: 20,
    },
    icon: {
      marginRight: theme.spacing.sm,
    },
    closeButton: {
      padding: theme.spacing.xs,
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: theme.spacing.sm,
      gap: theme.spacing.sm,
    },
    actionButton: {
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
      borderRadius: theme.borderRadius.sm,
    },
    primaryAction: {
      backgroundColor: theme.colors.primary,
    },
    secondaryAction: {
      backgroundColor: theme.colors.secondary,
    },
    textAction: {
      backgroundColor: 'transparent',
    },
    actionText: {
      fontSize: theme.typography.fontSize.bodySmall,
      fontWeight: '500',
    },
    primaryActionText: {
      color: theme.colors.white,
    },
    secondaryActionText: {
      color: theme.colors.white,
    },
    textActionText: {
      color: theme.colors.primary,
    },
  });

  return (
    <View style={styles.container}>
      {showIcon && (
        <Icon
          name={icon || defaultIcon}
          size={24}
          color={alertStyles.iconColor}
          style={styles.icon}
        />
      )}
      <View style={styles.content}>
        {title && <Text style={styles.title}>{title}</Text>}
        <Text style={styles.message}>{message}</Text>
        {actions && actions.length > 0 && (
          <View style={styles.actions}>
            {actions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.actionButton,
                  action.type === 'primary' && styles.primaryAction,
                  action.type === 'secondary' && styles.secondaryAction,
                  action.type === 'text' && styles.textAction,
                ]}
                onPress={action.onPress}
              >
                <Text
                  style={[
                    styles.actionText,
                    action.type === 'primary' && styles.primaryActionText,
                    action.type === 'secondary' && styles.secondaryActionText,
                    action.type === 'text' && styles.textActionText,
                  ]}
                >
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
      {showClose && (
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Icon name="x" size={20} color={theme.colors.text} />
        </TouchableOpacity>
      )}
    </View>
  );
}; 