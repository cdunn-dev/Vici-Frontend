import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  PanResponder,
  Animated,
  ViewStyle,
  TextStyle,
  Text,
} from 'react-native';
import { useTheme } from '../../../hooks/useTheme';

export interface SliderProps {
  /** Minimum value of the slider */
  min?: number;
  /** Maximum value of the slider */
  max?: number;
  /** Current value of the slider */
  value: number;
  /** Callback when the value changes */
  onValueChange: (value: number) => void;
  /** Step value for the slider */
  step?: number;
  /** Whether to show the value label */
  showValue?: boolean;
  /** Whether the slider is disabled */
  disabled?: boolean;
  /** Additional styles for the container */
  style?: ViewStyle;
  /** Additional styles for the track */
  trackStyle?: ViewStyle;
  /** Additional styles for the thumb */
  thumbStyle?: ViewStyle;
  /** Additional styles for the value label */
  valueStyle?: TextStyle;
  /** Test ID for testing */
  testID?: string;
}

/**
 * A reusable slider component for selecting values from a range
 */
export const Slider: React.FC<SliderProps> = ({
  min = 0,
  max = 100,
  value,
  onValueChange,
  step = 1,
  showValue = true,
  disabled = false,
  style,
  trackStyle,
  thumbStyle,
  valueStyle,
  testID = 'slider',
}) => {
  const theme = useTheme();
  const [sliderWidth, setSliderWidth] = useState(0);
  const pan = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const percentage = ((value - min) / (max - min)) * sliderWidth;
    pan.setValue(percentage);
  }, [value, min, max, sliderWidth, pan]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled,
      onMoveShouldSetPanResponder: () => !disabled,
      onPanResponderGrant: () => {
        pan.setOffset(pan._value);
      },
      onPanResponderMove: (_, gestureState) => {
        const newValue = Math.min(
          Math.max(0, pan._offset + gestureState.dx),
          sliderWidth
        );
        pan.setValue(newValue);
        const percentage = newValue / sliderWidth;
        const steppedValue = Math.round(
          (min + (max - min) * percentage) / step
        ) * step;
        onValueChange(steppedValue);
      },
      onPanResponderRelease: () => {
        pan.flattenOffset();
      },
    })
  ).current;

  const styles = StyleSheet.create({
    container: {
      width: '100%',
      ...style,
    },
    track: {
      height: 4,
      backgroundColor: theme.colors.text + '40',
      borderRadius: 2,
      ...trackStyle,
    },
    progress: {
      height: '100%',
      backgroundColor: theme.colors.primary,
      borderRadius: 2,
    },
    thumb: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: theme.colors.background,
      borderWidth: 2,
      borderColor: theme.colors.primary,
      position: 'absolute',
      top: -10,
      ...thumbStyle,
    },
    valueContainer: {
      position: 'absolute',
      top: -30,
      backgroundColor: theme.colors.background,
      padding: 4,
      borderRadius: 4,
      borderWidth: 1,
      borderColor: theme.colors.text + '40',
    },
    value: {
      color: theme.colors.text,
      fontSize: 12,
      ...valueStyle,
    },
  });

  return (
    <View
      style={styles.container}
      onLayout={event => setSliderWidth(event.nativeEvent.layout.width)}
      testID={testID}
    >
      <View style={styles.track}>
        <Animated.View
          style={[
            styles.progress,
            {
              width: pan.interpolate({
                inputRange: [0, sliderWidth],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
      <Animated.View
        style={[
          styles.thumb,
          {
            transform: [{ translateX: pan }],
          },
        ]}
        {...panResponder.panHandlers}
      />
      {showValue && (
        <Animated.View
          style={[
            styles.valueContainer,
            {
              transform: [{ translateX: pan }],
            },
          ]}
        >
          <Text style={styles.value}>{value}</Text>
        </Animated.View>
      )}
    </View>
  );
}; 