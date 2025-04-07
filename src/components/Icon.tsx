import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../utils/theme';
import { MaterialIcons } from '@expo/vector-icons';

interface IconProps {
  name: keyof typeof MaterialIcons.glyphMap;
  size?: number;
  color?: keyof typeof theme.colors;
  style?: ViewStyle;
}

const Icon = ({ name, size = 24, color = 'text', style }: IconProps) => {
  return (
    <MaterialIcons
      name={name}
      size={size}
      color={theme.colors[color]}
      style={[styles.icon, style]}
    />
  );
};

const styles = StyleSheet.create({
  icon: {
    textAlign: 'center',
  },
});

export default Icon; 