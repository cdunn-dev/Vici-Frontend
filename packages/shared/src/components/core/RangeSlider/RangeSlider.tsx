import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  Animated,
  ViewStyle,
  TextStyle,
  LayoutChangeEvent,
  GestureResponderEvent,
  PanResponderGestureState,
} from 'react-native';
import { useTheme } from '../../../hooks/useTheme';

export interface RangeSliderProps {
  /**
   * Minimum value of the slider
   */
  min: number;
  
  /**
   * Maximum value of the slider
   */
  max: number;
  
  /**
   * Current value or range [low, high] of the slider
   */
  value?: number | [number, number];
  
  /**
   * Function called when value changes
   */
  onChange?: (value: number | [number, number]) => void;
  
  /**
   * Function called when slider is released
   */
  onChangeComplete?: (value: number | [number, number]) => void;
  
  /**
   * Step value for the slider
   */
  step?: number;
  
  /**
   * Whether the slider is a range slider (two thumbs)
   */
  range?: boolean;
  
  /**
   * Label to display above the slider
   */
  label?: string;
  
  /**
   * Whether to show value labels
   */
  showLabels?: boolean;
  
  /**
   * Format function for value labels
   */
  formatLabel?: (value: number) => string;
  
  /**
   * Whether the slider is disabled
   */
  disabled?: boolean;
  
  /**
   * Whether the slider is required
   */
  required?: boolean;
  
  /**
   * Error message to display
   */
  error?: string;
  
  /**
   * Helper text to display
   */
  helperText?: string;
  
  /**
   * Height of the track in pixels
   */
  trackHeight?: number;
  
  /**
   * Size of the thumb in pixels
   */
  thumbSize?: number;
  
  /**
   * Color of the track
   */
  trackColor?: string;
  
  /**
   * Color of the active part of the track
   */
  activeTrackColor?: string;
  
  /**
   * Color of the thumb
   */
  thumbColor?: string;
  
  /**
   * Additional style for the container
   */
  style?: ViewStyle;
  
  /**
   * Additional style for the label text
   */
  labelStyle?: TextStyle;
  
  /**
   * Additional style for the value labels
   */
  valueLabelStyle?: TextStyle;
  
  /**
   * Test ID for testing
   */
  testID?: string;
}

/**
 * A slider component for selecting a value or range of values
 */
export const RangeSlider: React.FC<RangeSliderProps> = ({
  min,
  max,
  value,
  onChange,
  onChangeComplete,
  step = 1,
  range = false,
  label,
  showLabels = true,
  formatLabel = (value: number) => value.toString(),
  disabled = false,
  required = false,
  error,
  helperText,
  trackHeight = 4,
  thumbSize = 20,
  trackColor,
  activeTrackColor,
  thumbColor,
  style,
  labelStyle,
  valueLabelStyle,
  testID = 'range-slider',
}) => {
  const { colors, typography } = useTheme();
  
  // Define colors based on props or theme
  const defaultTrackColor = disabled ? colors.text + '30' : colors.text + '20';
  const defaultActiveTrackColor = disabled ? colors.primary + '60' : colors.primary;
  const defaultThumbColor = disabled ? colors.background + '80' : colors.background;
  
  const finalTrackColor = trackColor || defaultTrackColor;
  const finalActiveTrackColor = activeTrackColor || defaultActiveTrackColor;
  const finalThumbColor = thumbColor || defaultThumbColor;
  
  // Determine if we're using a range or single value
  const isRange = range || Array.isArray(value);
  const defaultValue = isRange ? [min, max] : (min + max) / 2;
  
  // Convert value to array for consistent handling
  const [sliderValues, setSliderValues] = useState<[number, number]>(() => {
    if (Array.isArray(value)) {
      return [value[0], value[1]];
    } else if (value !== undefined) {
      return isRange ? [min, value] : [min, value];
    } else {
      return isRange ? [min, max] : [min, defaultValue as number];
    }
  });
  
  // Update internal state when props change
  useEffect(() => {
    if (Array.isArray(value)) {
      setSliderValues([value[0], value[1]]);
    } else if (value !== undefined) {
      setSliderValues(isRange ? [min, value] : [min, value]);
    }
  }, [value, min, isRange]);
  
  // Track dimensions for calculations
  const [trackWidth, setTrackWidth] = useState(0);
  
  // Animated values for thumb positions
  const lowThumbPosition = useRef(new Animated.Value(0)).current;
  const highThumbPosition = useRef(new Animated.Value(0)).current;
  
  // Update thumb positions when values or dimensions change
  useEffect(() => {
    if (trackWidth > 0) {
      const lowValue = valueToPosition(sliderValues[0]);
      const highValue = valueToPosition(sliderValues[1]);
      
      lowThumbPosition.setValue(lowValue);
      highThumbPosition.setValue(highValue);
    }
  }, [sliderValues, trackWidth]);
  
  // Handle track layout to get dimensions
  const handleTrackLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setTrackWidth(width);
  };
  
  // Convert a value to a position on the track
  const valueToPosition = (value: number): number => {
    const boundedValue = Math.max(min, Math.min(max, value));
    return ((boundedValue - min) / (max - min)) * trackWidth;
  };
  
  // Convert a position to a valid stepped value
  const positionToValue = (position: number): number => {
    const ratio = Math.max(0, Math.min(1, position / trackWidth));
    const rawValue = min + ratio * (max - min);
    
    // Apply stepping
    const steppedValue = Math.round(rawValue / step) * step;
    return Math.max(min, Math.min(max, steppedValue));
  };
  
  // Create pan responders for both thumbs
  const createPanResponder = (isLow: boolean) => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled,
      onMoveShouldSetPanResponder: () => !disabled,
      onPanResponderGrant: () => {
        // Keep the current value when starting drag
        // No need to set offset as we're using absolute values
      },
      onPanResponderMove: (event: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        if (disabled) return;
        
        const position = gestureState.moveX - (event.nativeEvent as any).locationX;
        const newValue = positionToValue(position);
        
        if (isRange) {
          if (isLow) {
            // Low thumb cannot go higher than high thumb
            const newValues: [number, number] = [
              Math.min(newValue, sliderValues[1] - step),
              sliderValues[1]
            ];
            setSliderValues(newValues);
            onChange?.(newValues);
          } else {
            // High thumb cannot go lower than low thumb
            const newValues: [number, number] = [
              sliderValues[0],
              Math.max(newValue, sliderValues[0] + step)
            ];
            setSliderValues(newValues);
            onChange?.(newValues);
          }
        } else if (!isLow) {
          // Only high thumb is used for single value slider
          const newValues: [number, number] = [min, newValue];
          setSliderValues(newValues);
          onChange?.(newValue);
        }
      },
      onPanResponderRelease: () => {
        if (disabled) return;
        
        if (isRange) {
          onChangeComplete?.(sliderValues);
        } else {
          onChangeComplete?.(sliderValues[1]);
        }
      }
    });
  };
  
  const lowThumbPanResponder = useRef(createPanResponder(true)).current;
  const highThumbPanResponder = useRef(createPanResponder(false)).current;
  
  return (
    <View style={[styles.container, style]} testID={testID}>
      {label && (
        <Text
          style={[
            styles.label,
            { color: colors.text, fontSize: typography.fontSize.bodyMedium },
            labelStyle
          ]}
          testID={`${testID}-label`}
        >
          {label}
          {required && <Text style={{ color: colors.error }}> *</Text>}
        </Text>
      )}
      
      {showLabels && (
        <View style={styles.valueLabelsContainer} testID={`${testID}-value-labels`}>
          {isRange && (
            <Text
              style={[
                styles.valueLabel,
                { color: disabled ? colors.text + '40' : colors.text },
                valueLabelStyle
              ]}
              testID={`${testID}-low-value`}
            >
              {formatLabel(sliderValues[0])}
            </Text>
          )}
          
          <Text
            style={[
              styles.valueLabel,
              { color: disabled ? colors.text + '40' : colors.text },
              valueLabelStyle
            ]}
            testID={`${testID}-high-value`}
          >
            {formatLabel(sliderValues[1])}
          </Text>
        </View>
      )}
      
      <View
        style={[styles.trackContainer, { height: thumbSize }]}
        onLayout={handleTrackLayout}
        testID={`${testID}-track-container`}
      >
        {/* Base track */}
        <View 
          style={[
            styles.track,
            {
              backgroundColor: finalTrackColor,
              height: trackHeight,
              top: (thumbSize - trackHeight) / 2,
            }
          ]}
          testID={`${testID}-track`}
        />
        
        {/* Active track */}
        <Animated.View
          style={[
            styles.activeTrack,
            {
              backgroundColor: finalActiveTrackColor,
              height: trackHeight,
              top: (thumbSize - trackHeight) / 2,
              left: isRange ? lowThumbPosition : 0,
              right: trackWidth - (highThumbPosition as any),
            }
          ]}
          testID={`${testID}-active-track`}
        />
        
        {/* Thumbs */}
        {isRange && (
          <Animated.View
            style={[
              styles.thumb,
              {
                width: thumbSize,
                height: thumbSize,
                borderRadius: thumbSize / 2,
                backgroundColor: finalThumbColor,
                borderColor: finalActiveTrackColor,
                transform: [{ translateX: Animated.subtract(lowThumbPosition, thumbSize / 2) }],
              }
            ]}
            {...lowThumbPanResponder.panHandlers}
            testID={`${testID}-low-thumb`}
          />
        )}
        
        <Animated.View
          style={[
            styles.thumb,
            {
              width: thumbSize,
              height: thumbSize,
              borderRadius: thumbSize / 2,
              backgroundColor: finalThumbColor,
              borderColor: finalActiveTrackColor,
              transform: [{ translateX: Animated.subtract(highThumbPosition, thumbSize / 2) }],
            }
          ]}
          {...highThumbPanResponder.panHandlers}
          testID={`${testID}-high-thumb`}
        />
      </View>
      
      {/* Min/max labels */}
      {showLabels && (
        <View style={styles.minMaxLabelsContainer} testID={`${testID}-min-max-labels`}>
          <Text
            style={[
              styles.minMaxLabel,
              { color: disabled ? colors.text + '40' : colors.text + '80' },
              valueLabelStyle
            ]}
          >
            {formatLabel(min)}
          </Text>
          <Text
            style={[
              styles.minMaxLabel,
              { color: disabled ? colors.text + '40' : colors.text + '80' },
              valueLabelStyle
            ]}
          >
            {formatLabel(max)}
          </Text>
        </View>
      )}
      
      {error && (
        <Text
          style={[styles.errorText, { color: colors.error }]}
          testID={`${testID}-error`}
        >
          {error}
        </Text>
      )}
      
      {helperText && !error && (
        <Text
          style={[styles.helperText, { color: colors.text + '80' }]}
          testID={`${testID}-helper-text`}
        >
          {helperText}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontWeight: '500',
  },
  trackContainer: {
    width: '100%',
    position: 'relative',
  },
  track: {
    width: '100%',
    position: 'absolute',
    borderRadius: 2,
  },
  activeTrack: {
    position: 'absolute',
    borderRadius: 2,
  },
  thumb: {
    position: 'absolute',
    borderWidth: 2,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  valueLabelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  valueLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  minMaxLabelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  minMaxLabel: {
    fontSize: 12,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
  },
}); 