import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ViewStyle } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { Icon } from '../../core/Icon';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface NotificationProps {
  type?: NotificationType;
  title?: string;
  message: string;
  duration?: number;
  onClose?: () => void;
  autoClose?: boolean;
  testID?: string;
  style?: ViewStyle;
}

export const Notification: React.FC<NotificationProps> = ({
  type = 'info',
  title,
  message,
  duration = 5000,
  onClose,
  autoClose = true,
  testID,
  style,
}) => {
  const theme = useTheme();
  const [opacity] = useState(new Animated.Value(0));
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Fade in animation
    Animated.timing(opacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Auto close timer
    if (autoClose && duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    // Fade out animation
    Animated.timing(opacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsVisible(false);
      onClose?.();
    });
  };

  if (!isVisible) {
    return null;
  }

  const getNotificationColor = () => {
    switch (type) {
      case 'success':
        return theme.colors.success;
      case 'warning':
        return theme.colors.warning;
      case 'error':
        return theme.colors.error;
      case 'info':
      default:
        return theme.colors.info;
    }
  };

  const getIconName = () => {
    switch (type) {
      case 'success':
        return 'check-circle';
      case 'warning':
        return 'alert-triangle';
      case 'error':
        return 'alert-circle';
      case 'info':
      default:
        return 'info';
    }
  };

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      backgroundColor: theme.colors.backgroundSecondary,
      borderLeftWidth: 4,
      borderLeftColor: getNotificationColor(),
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginVertical: theme.spacing.sm,
      shadowColor: theme.colors.shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
      ...style,
    },
    iconContainer: {
      marginRight: theme.spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    contentContainer: {
      flex: 1,
    },
    titleText: {
      fontSize: theme.typography.fontSize.bodyLarge,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    messageText: {
      fontSize: theme.typography.fontSize.bodyMedium,
      color: theme.colors.textSecondary,
    },
    closeButton: {
      padding: theme.spacing.xs,
      alignSelf: 'flex-start',
      marginLeft: theme.spacing.sm,
    },
  });

  return (
    <Animated.View
      style={[styles.container, { opacity }]}
      testID={testID}
    >
      <View style={styles.iconContainer}>
        <Icon
          name={getIconName()}
          size={24}
          color={getNotificationColor()}
        />
      </View>
      <View style={styles.contentContainer}>
        {title && <Text style={styles.titleText}>{title}</Text>}
        <Text style={styles.messageText}>{message}</Text>
      </View>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={handleClose}
        testID="close-button"
      >
        <Icon name="x" size={16} color={theme.colors.textSecondary} />
      </TouchableOpacity>
    </Animated.View>
  );
}; 