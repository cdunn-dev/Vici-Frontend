import React from 'react';
import { Text as RNText, StyleSheet, TextStyle, TextProps as RNTextProps } from 'react-native';
import { theme } from '../utils/theme';

interface TextProps extends RNTextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption';
  color?: keyof typeof theme.colors;
  style?: TextStyle;
  numberOfLines?: number;
  ellipsizeMode?: 'head' | 'middle' | 'tail' | 'clip';
}

const Text = ({
  children,
  variant = 'body',
  color = 'text',
  style,
  numberOfLines,
  ellipsizeMode,
  ...props
}: TextProps) => {
  const textStyle = StyleSheet.flatten([
    styles.text,
    styles[variant],
    { color: theme.colors[color] },
    style,
  ]);

  return (
    <RNText
      style={textStyle}
      numberOfLines={numberOfLines}
      ellipsizeMode={ellipsizeMode}
      {...props}
    >
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  text: {
    ...theme.typography.body,
  },
  h1: {
    ...theme.typography.h1,
  },
  h2: {
    ...theme.typography.h2,
  },
  h3: {
    ...theme.typography.h3,
  },
  body: {
    ...theme.typography.body,
  },
  caption: {
    ...theme.typography.caption,
  },
});

export default Text; 