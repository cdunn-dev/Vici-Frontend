import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  Animated,
  Easing,
  TouchableWithoutFeedback,
} from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { Text } from '../Text';
import { Icon } from '../Icon';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastProps {
  /** Toast message */
  message: string;
  /** Toast type */
  type?: ToastType;
  /** Whether the toast is visible */
  visible: boolean;
  /** Callback when the toast is dismissed */
  onDismiss: () => void;
  /** Duration in milliseconds before auto-dismiss */
  duration?: number;
  /** Custom styles */
  style?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}

/**
 * A reusable toast component that displays temporary notifications
 */
export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  visible,
  onDismiss,
  duration = 3000,
  style,
  testID,
}) => {
  const theme = useTheme();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(-100)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        onDismiss();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 300,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, slideAnim, duration, onDismiss]);

  const getTypeStyle = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: theme.colors.success,
          icon: 'check-circle',
        };
      case 'error':
        return {
          backgroundColor: theme.colors.error,
          icon: 'alert-circle',
        };
      case 'warning':
        return {
          backgroundColor: theme.colors.warning,
          icon: 'alert',
        };
      case 'info':
      default:
        return {
          backgroundColor: theme.colors.primary,
          icon: 'info',
        };
    }
  };

  const typeStyle = getTypeStyle();

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      padding: 16,
      zIndex: 1000,
      ...style,
    },
    toast: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: typeStyle.backgroundColor,
      borderRadius: 8,
      padding: 12,
      minHeight: 48,
    },
    icon: {
      marginRight: 8,
    },
    message: {
      flex: 1,
      color: theme.colors.background,
      fontSize: 14,
    },
  });

  if (!visible) return null;

  return (
    <TouchableWithoutFeedback onPress={onDismiss}>
      <Animated.View
        style={[
          styles.container,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
        testID={testID}
      >
        <View style={styles.toast}>
          <Icon
            name={typeStyle.icon}
            size={24}
            color={theme.colors.background}
            style={styles.icon}
          />
          <Text style={styles.message}>{message}</Text>
        </View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}; 