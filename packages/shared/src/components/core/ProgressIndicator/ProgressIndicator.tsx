import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';

export type ProgressIndicatorType = 'linear' | 'circular' | 'steps';
export type ProgressIndicatorSize = 'small' | 'medium' | 'large';

export interface ProgressIndicatorProps {
  type?: ProgressIndicatorType;
  size?: ProgressIndicatorSize;
  value: number;
  maxValue?: number;
  showValue?: boolean;
  label?: string;
  color?: string;
  backgroundColor?: string;
  thickness?: number;
  style?: ViewStyle;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  type = 'linear',
  size = 'medium',
  value,
  maxValue = 100,
  showValue = true,
  label,
  color,
  backgroundColor,
  thickness,
  style,
}) => {
  const theme = useTheme();

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          height: 4,
          fontSize: 12,
          padding: 4,
        };
      case 'large':
        return {
          height: 12,
          fontSize: 16,
          padding: 8,
        };
      default:
        return {
          height: 8,
          fontSize: 14,
          padding: 6,
        };
    }
  };

  const getProgressColor = () => {
    if (color) return color;
    
    if (value >= maxValue * 0.8) return theme.colors.success;
    if (value >= maxValue * 0.5) return theme.colors.primary;
    if (value >= maxValue * 0.3) return theme.colors.warning;
    return theme.colors.error;
  };

  const getBackgroundColor = () => {
    if (backgroundColor) return backgroundColor;
    return theme.colors.backgroundSecondary;
  };

  const getThickness = () => {
    if (thickness) return thickness;
    return getSizeStyles().height;
  };

  const progress = Math.min(Math.max(value, 0), maxValue);
  const percentage = (progress / maxValue) * 100;
  const sizeStyles = getSizeStyles();
  const progressColor = getProgressColor();
  const bgColor = getBackgroundColor();
  const indicatorThickness = getThickness();

  const styles = StyleSheet.create({
    container: {
      width: '100%',
      ...style,
    },
    linearContainer: {
      height: sizeStyles.height,
      backgroundColor: bgColor,
      borderRadius: theme.borderRadius.full,
      overflow: 'hidden',
    },
    linearProgress: {
      height: '100%',
      backgroundColor: progressColor,
      borderRadius: theme.borderRadius.full,
    },
    circularContainer: {
      width: sizeStyles.height * 8,
      height: sizeStyles.height * 8,
      borderRadius: theme.borderRadius.full,
      backgroundColor: bgColor,
      justifyContent: 'center',
      alignItems: 'center',
    },
    circularProgress: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      borderRadius: theme.borderRadius.full,
      borderWidth: indicatorThickness,
      borderColor: progressColor,
      borderStyle: 'solid',
    },
    stepsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    step: {
      flex: 1,
      height: sizeStyles.height,
      backgroundColor: bgColor,
      marginHorizontal: 2,
      borderRadius: theme.borderRadius.sm,
    },
    activeStep: {
      backgroundColor: progressColor,
    },
    label: {
      fontSize: sizeStyles.fontSize,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    value: {
      fontSize: sizeStyles.fontSize,
      color: theme.colors.text,
      marginTop: theme.spacing.xs,
      textAlign: 'center',
    },
  });

  const renderLinear = () => (
    <View style={styles.linearContainer}>
      <View style={[styles.linearProgress, { width: `${percentage}%` }]} />
    </View>
  );

  const renderCircular = () => (
    <View style={styles.circularContainer}>
      <View
        style={[
          styles.circularProgress,
          {
            borderColor: progressColor,
            borderWidth: indicatorThickness,
          },
        ]}
      />
      {showValue && (
        <Text style={styles.value}>{`${Math.round(percentage)}%`}</Text>
      )}
    </View>
  );

  const renderSteps = () => {
    const steps = Array.from({ length: maxValue }, (_, i) => i + 1);
    return (
      <View style={styles.stepsContainer}>
        {steps.map((step) => (
          <View
            key={step}
            style={[
              styles.step,
              step <= progress && styles.activeStep,
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      {type === 'linear' && renderLinear()}
      {type === 'circular' && renderCircular()}
      {type === 'steps' && renderSteps()}
      {type !== 'circular' && showValue && (
        <Text style={styles.value}>{`${Math.round(percentage)}%`}</Text>
      )}
    </View>
  );
}; 