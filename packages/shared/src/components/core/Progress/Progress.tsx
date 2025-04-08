import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  Animated,
  Easing,
} from 'react-native';
import { useTheme } from '../../../hooks/useTheme';

export interface ProgressProps {
  /** Current progress value (0-100) */
  value: number;
  /** Type of progress indicator */
  type?: 'linear' | 'circular';
  /** Size of the progress indicator */
  size?: 'small' | 'medium' | 'large';
  /** Whether to show the progress value */
  showValue?: boolean;
  /** Whether the progress is indeterminate */
  indeterminate?: boolean;
  /** Additional styles for the container */
  style?: ViewStyle;
  /** Additional styles for the progress bar */
  progressStyle?: ViewStyle;
  /** Additional styles for the track */
  trackStyle?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}

/**
 * A reusable progress indicator component
 */
export const Progress: React.FC<ProgressProps> = ({
  value,
  type = 'linear',
  size = 'medium',
  showValue = false,
  indeterminate = false,
  style,
  progressStyle,
  trackStyle,
  testID = 'progress',
}) => {
  const theme = useTheme();
  const [progress] = React.useState(new Animated.Value(0));
  const [rotation] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    if (indeterminate) {
      Animated.loop(
        Animated.timing(rotation, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      Animated.timing(progress, {
        toValue: value / 100,
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: false,
      }).start();
    }
  }, [value, indeterminate, progress, rotation]);

  const getSize = () => {
    switch (size) {
      case 'small':
        return type === 'linear' ? 4 : 24;
      case 'large':
        return type === 'linear' ? 8 : 48;
      default:
        return type === 'linear' ? 6 : 36;
    }
  };

  const styles = StyleSheet.create({
    container: {
      width: type === 'linear' ? '100%' : getSize(),
      height: type === 'linear' ? getSize() : getSize(),
      ...style,
    },
    track: {
      width: '100%',
      height: '100%',
      backgroundColor: theme.colors.text + '20',
      borderRadius: type === 'linear' ? getSize() / 2 : getSize() / 2,
      overflow: 'hidden',
      ...trackStyle,
    },
    progress: {
      width: '100%',
      height: '100%',
      backgroundColor: theme.colors.primary,
      borderRadius: type === 'linear' ? getSize() / 2 : getSize() / 2,
      ...progressStyle,
    },
    circularTrack: {
      width: '100%',
      height: '100%',
      borderRadius: getSize() / 2,
      borderWidth: getSize() / 6,
      borderColor: theme.colors.text + '20',
      ...trackStyle,
    },
    circularProgress: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      borderRadius: getSize() / 2,
      borderWidth: getSize() / 6,
      borderColor: theme.colors.primary,
      borderLeftColor: 'transparent',
      borderBottomColor: 'transparent',
      ...progressStyle,
    },
  });

  if (type === 'linear') {
    return (
      <View style={styles.container} testID={testID}>
        <View style={styles.track}>
          <Animated.View
            style={[
              styles.progress,
              {
                width: indeterminate
                  ? '50%'
                  : progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
              },
            ]}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.circularTrack}>
        <Animated.View
          style={[
            styles.circularProgress,
            {
              transform: [
                {
                  rotate: indeterminate
                    ? rotation.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '360deg'],
                      })
                    : '0deg',
                },
              ],
            },
          ]}
        />
      </View>
    </View>
  );
}; 