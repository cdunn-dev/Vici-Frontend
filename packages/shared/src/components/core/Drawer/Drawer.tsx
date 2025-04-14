import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  Animated,
  Easing,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import { useTheme } from "@/theme/useTheme";

export type DrawerPosition = 'left' | 'right' | 'top' | 'bottom';

export interface DrawerProps {
  /** Whether the drawer is visible */
  visible: boolean;
  /** Callback when the drawer is dismissed */
  onDismiss: () => void;
  /** Position of the drawer */
  position?: DrawerPosition;
  /** Width of the drawer (for left/right position) */
  width?: number;
  /** Height of the drawer (for top/bottom position) */
  height?: number;
  /** Custom styles */
  style?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
  /** Drawer content */
  children: React.ReactNode;
}

/**
 * A reusable drawer component that displays content in a sliding panel
 */
export const Drawer: React.FC<DrawerProps> = ({
  visible,
  onDismiss,
  position = 'left',
  width = 300,
  height = 300,
  style,
  testID,
  children,
}) => {
  const theme = useTheme();
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const slideAnim = React.useRef(new Animated.Value(0)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, fadeAnim]);

  const getPositionStyle = () => {
    switch (position) {
      case 'left':
        return {
          left: 0,
          width,
          height: screenHeight,
          transform: [{ translateX: Animated.multiply(slideAnim, -width) }],
        };
      case 'right':
        return {
          right: 0,
          width,
          height: screenHeight,
          transform: [{ translateX: Animated.multiply(slideAnim, width) }],
        };
      case 'top':
        return {
          top: 0,
          width: screenWidth,
          height,
          transform: [{ translateY: Animated.multiply(slideAnim, -height) }],
        };
      case 'bottom':
        return {
          bottom: 0,
          width: screenWidth,
          height,
          transform: [{ translateY: Animated.multiply(slideAnim, height) }],
        };
    }
  };

  const styles = StyleSheet.create({
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    drawer: {
      position: 'absolute',
      backgroundColor: theme.colors.background,
      ...getPositionStyle(),
      ...style,
    },
  });

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill} testID={testID}>
      <TouchableWithoutFeedback onPress={onDismiss}>
        <Animated.View style={[styles.overlay, { opacity: fadeAnim }]} />
      </TouchableWithoutFeedback>
      <Animated.View style={styles.drawer}>{children}</Animated.View>
    </View>
  );
}; 