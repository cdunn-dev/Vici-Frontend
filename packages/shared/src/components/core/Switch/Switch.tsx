import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  Animated,
} from 'react-native';
import { useTheme } from "@/theme/useTheme";

export interface SwitchProps {
  /** Whether the switch is on */
  value: boolean;
  /** Callback when the switch is toggled */
  onValueChange: (value: boolean) => void;
  /** Whether the switch is disabled */
  disabled?: boolean;
  /** Size of the switch */
  size?: 'small' | 'medium' | 'large';
  /** Additional styles for the container */
  style?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}

const SWITCH_SIZES = {
  small: {
    width: 36,
    height: 20,
    thumbSize: 16,
  },
  medium: {
    width: 48,
    height: 24,
    thumbSize: 20,
  },
  large: {
    width: 60,
    height: 32,
    thumbSize: 28,
  },
};

/**
 * A reusable switch component for toggling between two states
 */
export const Switch: React.FC<SwitchProps> = ({
  value,
  onValueChange,
  disabled = false,
  size = 'medium',
  style,
  testID = 'switch',
}) => {
  const theme = useTheme();
  const switchAnimation = React.useRef(new Animated.Value(value ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.timing(switchAnimation, {
      toValue: value ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [value, switchAnimation]);

  const styles = StyleSheet.create({
    container: {
      ...style,
    },
    track: {
      width: SWITCH_SIZES[size].width,
      height: SWITCH_SIZES[size].height,
      borderRadius: SWITCH_SIZES[size].height / 2,
      backgroundColor: value ? theme.colors.primary : theme.colors.text + '40',
      opacity: disabled ? 0.5 : 1,
      justifyContent: 'center',
    },
    thumb: {
      width: SWITCH_SIZES[size].thumbSize,
      height: SWITCH_SIZES[size].thumbSize,
      borderRadius: SWITCH_SIZES[size].thumbSize / 2,
      backgroundColor: theme.colors.background,
      position: 'absolute',
      left: 2,
      shadowColor: theme.colors.text,
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.2,
      shadowRadius: 1.41,
      elevation: 2,
    },
  });

  const thumbPosition = switchAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [
      2,
      SWITCH_SIZES[size].width - SWITCH_SIZES[size].thumbSize - 2,
    ],
  });

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => !disabled && onValueChange(!value)}
      disabled={disabled}
      testID={testID}
    >
      <View style={styles.track}>
        <Animated.View
          style={[
            styles.thumb,
            {
              transform: [{ translateX: thumbPosition }],
            },
          ]}
        />
      </View>
    </TouchableOpacity>
  );
}; 