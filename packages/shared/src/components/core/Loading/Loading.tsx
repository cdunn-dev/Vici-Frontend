import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';

export interface LoadingProps {
  /** Size of the loading indicator */
  size?: 'small' | 'medium' | 'large';
  
  /** Color of the loading indicator */
  color?: string;
  
  /** Whether to show with a fullscreen overlay */
  fullscreen?: boolean;
  
  /** Text to display below the loading indicator */
  text?: string;
  
  /** Whether to show the loading indicator inline or as a block */
  inline?: boolean;
  
  /** Additional style for the container */
  style?: ViewStyle;
  
  /** Additional style for the text */
  textStyle?: TextStyle;
  
  /** Test ID for testing */
  testID?: string;
}

/**
 * Loading component to indicate that content is loading
 */
export const Loading: React.FC<LoadingProps> = ({
  size = 'medium',
  color,
  fullscreen = false,
  text,
  inline = false,
  style,
  textStyle,
  testID = 'loading',
}) => {
  const { colors } = useTheme();
  
  const indicatorColor = color || colors.primary;
  
  const getSize = (): number => {
    switch (size) {
      case 'small':
        return 16;
      case 'large':
        return 48;
      case 'medium':
      default:
        return 32;
    }
  };
  
  const renderContent = () => (
    <View
      style={[
        styles.container,
        inline && styles.inline,
        style
      ]}
      testID={testID}
    >
      <ActivityIndicator
        size={getSize()}
        color={indicatorColor}
        testID={`${testID}-indicator`}
      />
      {text && (
        <Text
          style={[
            styles.text,
            { color: colors.text },
            textStyle
          ]}
          testID={`${testID}-text`}
        >
          {text}
        </Text>
      )}
    </View>
  );
  
  if (fullscreen) {
    return (
      <View style={[styles.fullscreen, { backgroundColor: `${colors.background}CC` }]}>
        {renderContent()}
      </View>
    );
  }
  
  return renderContent();
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  inline: {
    flexDirection: 'row',
    padding: 0,
  },
  fullscreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  text: {
    marginTop: 8,
    textAlign: 'center',
  },
}); 