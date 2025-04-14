import React from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { useTheme } from "@/theme/useTheme";

export interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: any;
  testID?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
  testID = 'skeleton',
}) => {
  const theme = useTheme();
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 0.8],
  });

  const styles = StyleSheet.create({
    skeleton: {
      width,
      height,
      borderRadius,
      backgroundColor: theme.colors.text,
      ...style,
    },
  });

  return (
    <Animated.View
      style={[styles.skeleton, { opacity }]}
      testID={testID}
    />
  );
}; 