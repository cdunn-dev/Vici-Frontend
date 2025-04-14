import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableWithoutFeedback,
  Animated,
  Easing,
} from 'react-native';
import { useTheme } from "@/theme/useTheme";
import { Text } from '../Text';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  /** Tooltip content */
  content: string;
  /** Tooltip position relative to the children */
  position?: TooltipPosition;
  /** Whether the tooltip is visible */
  visible: boolean;
  /** Callback when the tooltip is dismissed */
  onDismiss: () => void;
  /** Custom styles */
  style?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}

/**
 * A reusable tooltip component that displays additional information
 */
export const Tooltip: React.FC<TooltipProps> = ({
  content,
  position = 'top',
  visible,
  onDismiss,
  style,
  testID,
}) => {
  const theme = useTheme();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: visible ? 1 : 0,
      duration: 200,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }, [visible, fadeAnim]);

  const getPositionStyle = (): ViewStyle => {
    switch (position) {
      case 'top':
        return {
          bottom: '100%',
          left: '50%',
          transform: [{ translateX: -50 }],
          marginBottom: 8,
        };
      case 'bottom':
        return {
          top: '100%',
          left: '50%',
          transform: [{ translateX: -50 }],
          marginTop: 8,
        };
      case 'left':
        return {
          right: '100%',
          top: '50%',
          transform: [{ translateY: -50 }],
          marginRight: 8,
        };
      case 'right':
        return {
          left: '100%',
          top: '50%',
          transform: [{ translateY: -50 }],
          marginLeft: 8,
        };
    }
  };

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      ...getPositionStyle(),
      ...style,
    } as ViewStyle,
    tooltip: {
      backgroundColor: theme.colors.text,
      borderRadius: 4,
      padding: 8,
      maxWidth: 200,
    },
    content: {
      color: theme.colors.background,
      fontSize: 12,
    },
  });

  if (!visible) return null;

  return (
    <TouchableWithoutFeedback onPress={onDismiss}>
      <Animated.View
        style={[styles.container, { opacity: fadeAnim }]}
        testID={testID}
      >
        <View style={styles.tooltip}>
          <Text style={styles.content}>{content}</Text>
        </View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}; 