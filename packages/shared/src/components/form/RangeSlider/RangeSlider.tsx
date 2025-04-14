import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ViewStyle, PanResponder } from 'react-native';
import { useTheme } from '@/theme/useTheme';

export interface RangeSliderProps {
  /**
   * Minimum value
   */
  min?: number;
  /**
   * Maximum value
   */
  max?: number;
  /**
   * Initial start value
   */
  startValue?: number;
  /**
   * Initial end value
   */
  endValue?: number;
  /**
   * Step for incrementing/decrementing values
   */
  step?: number;
  /**
   * Callback when values change
   */
  onChange?: (values: [number, number]) => void;
  /**
   * Whether the slider is disabled
   */
  disabled?: boolean;
  /**
   * Component label
   */
  label?: string;
  /**
   * Format function for displaying values
   */
  formatValue?: (value: number) => string;
  /**
   * Additional styles for the container
   */
  style?: ViewStyle;
  /**
   * Test ID for testing
   */
  testID?: string;
}

/**
 * A range slider component (placeholder)
 */
export const RangeSlider: React.FC<RangeSliderProps> = ({
  min = 0,
  max = 100,
  startValue = 25,
  endValue = 75,
  step = 1,
  onChange,
  disabled = false,
  label,
  formatValue = (value) => value.toString(),
  style,
  testID = 'range-slider',
}) => {
  const theme = useTheme();
  const [values, setValues] = useState<[number, number]>([startValue, endValue]);

  useEffect(() => {
    setValues([startValue, endValue]);
  }, [startValue, endValue]);

  const updateValues = (newValues: [number, number]) => {
    setValues(newValues);
    onChange?.(newValues);
  };

  // This is a simplified placeholder implementation
  // A real implementation would use PanResponder to handle dragging of thumbs
  
  const styles = StyleSheet.create({
    container: {
      width: '100%',
      ...style,
    },
    label: {
      fontSize: theme.typography.fontSize.bodyMedium,
      fontWeight: 'bold',
      marginBottom: theme.spacing.xs,
      color: theme.colors.text,
    },
    sliderContainer: {
      height: 40,
      position: 'relative',
      marginVertical: theme.spacing.sm,
      opacity: disabled ? 0.5 : 1,
    },
    track: {
      height: 4,
      backgroundColor: theme.colors.backgroundSecondary,
      borderRadius: theme.borderRadius.full,
      position: 'absolute',
      top: 18,
      left: 0,
      right: 0,
    },
    selectedTrack: {
      position: 'absolute',
      height: 4,
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.full,
      top: 18,
    },
    thumb: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: theme.colors.primary,
      position: 'absolute',
      top: 10,
      borderWidth: 2,
      borderColor: theme.colors.white,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
    },
    valueContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: theme.spacing.xs,
    },
    value: {
      fontSize: theme.typography.fontSize.bodySmall,
      color: theme.colors.textSecondary,
    },
  });

  // Calculate positions for UI elements
  const trackWidth = 100; // Percentage-based for this placeholder
  const startPercent = ((values[0] - min) / (max - min)) * 100;
  const endPercent = ((values[1] - min) / (max - min)) * 100;

  return (
    <View style={styles.container} testID={testID}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={styles.sliderContainer}>
        <View style={styles.track} />
        <View
          style={[
            styles.selectedTrack,
            {
              left: `${startPercent}%`,
              width: `${endPercent - startPercent}%`,
            },
          ]}
        />
        <View
          style={[
            styles.thumb,
            {
              left: (startPercent / 100) * (trackWidth - 20),
            },
          ]}
        />
        <View
          style={[
            styles.thumb,
            {
              left: (endPercent / 100) * (trackWidth - 20),
            },
          ]}
        />
      </View>
      
      <View style={styles.valueContainer}>
        <Text style={styles.value}>{formatValue(values[0])}</Text>
        <Text style={styles.value}>{formatValue(values[1])}</Text>
      </View>
    </View>
  );
}; 