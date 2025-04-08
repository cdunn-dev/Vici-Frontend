import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';

export type BadgeVariant = 'primary' | 'success' | 'warning' | 'error' | 'info';
export type BadgeSize = 'small' | 'medium' | 'large';

export interface BadgeProps {
  /** Content to display inside the badge */
  children?: React.ReactNode;
  /** Visual variant of the badge */
  variant?: BadgeVariant;
  /** Size of the badge */
  size?: BadgeSize;
  /** Whether the badge is outlined */
  outlined?: boolean;
  /** Whether to display the badge as a dot */
  dot?: boolean;
  /** Additional styles for the badge container */
  style?: StyleProp<ViewStyle>;
  /** Additional styles for the text */
  textStyle?: StyleProp<TextStyle>;
  /** Test ID for testing */
  testID?: string;
}

const VARIANT_COLORS: Record<BadgeVariant, { background: string; text: string; border: string }> = {
  primary: { background: '#5224EF', text: '#FFFFFF', border: '#5224EF' },
  success: { background: '#16A34A', text: '#FFFFFF', border: '#16A34A' },
  warning: { background: '#F59E0B', text: '#FFFFFF', border: '#F59E0B' },
  error: { background: '#DC2626', text: '#FFFFFF', border: '#DC2626' },
  info: { background: '#3B82F6', text: '#FFFFFF', border: '#3B82F6' },
};

const SIZE_STYLES: Record<BadgeSize, { padding: number; fontSize: number; dotSize: number }> = {
  small: { padding: 4, fontSize: 10, dotSize: 6 },
  medium: { padding: 6, fontSize: 12, dotSize: 8 },
  large: { padding: 8, fontSize: 14, dotSize: 10 },
};

/**
 * A reusable badge component that supports different variants, sizes, and styles
 */
export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  outlined = false,
  dot = false,
  style,
  textStyle,
  testID = 'badge',
}) => {
  const variantColors = VARIANT_COLORS[variant];
  const sizeStyles = SIZE_STYLES[size];

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 100,
      backgroundColor: outlined ? 'transparent' : variantColors.background,
      borderWidth: outlined ? 1 : 0,
      borderColor: variantColors.border,
      paddingVertical: dot ? 0 : sizeStyles.padding,
      paddingHorizontal: dot ? 0 : sizeStyles.padding * 2,
      minWidth: dot ? sizeStyles.dotSize : undefined,
      height: dot ? sizeStyles.dotSize : undefined,
    },
    text: {
      color: outlined ? variantColors.border : variantColors.text,
      fontSize: sizeStyles.fontSize,
      fontWeight: '500',
      textAlign: 'center',
    },
  });

  return (
    <View style={[styles.container, style]} testID={testID}>
      {!dot && children && (
        <Text style={[styles.text, textStyle]} testID={`${testID}-text`}>
          {children}
        </Text>
      )}
    </View>
  );
}; 