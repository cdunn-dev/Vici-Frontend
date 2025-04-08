import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
  StyleProp,
} from 'react-native';

export interface CardProps {
  /** Content to be rendered inside the card */
  children: React.ReactNode;
  /** Optional header content */
  header?: React.ReactNode;
  /** Optional footer content */
  footer?: React.ReactNode;
  /** Visual variant of the card */
  variant?: 'elevated' | 'outlined' | 'flat';
  /** Whether the card is pressable */
  onPress?: () => void;
  /** Whether the card is disabled */
  disabled?: boolean;
  /** Additional styles for the card container */
  style?: StyleProp<ViewStyle>;
  /** Additional styles for the content container */
  contentStyle?: StyleProp<ViewStyle>;
  /** Additional styles for the header container */
  headerStyle?: StyleProp<ViewStyle>;
  /** Additional styles for the footer container */
  footerStyle?: StyleProp<ViewStyle>;
  /** Test ID for testing */
  testID?: string;
}

/**
 * A reusable card component that supports different variants and optional header/footer sections
 */
export const Card: React.FC<CardProps> = ({
  children,
  header,
  footer,
  variant = 'elevated',
  onPress,
  disabled = false,
  style,
  contentStyle,
  headerStyle,
  footerStyle,
  testID = 'card',
}) => {
  const styles = StyleSheet.create({
    container: {
      borderRadius: 12,
      backgroundColor: '#FFFFFF',
      overflow: 'hidden',
      opacity: disabled ? 0.5 : 1,
      ...(variant === 'elevated' && {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
      }),
      ...(variant === 'outlined' && {
        borderWidth: 1,
        borderColor: '#E5E7EB',
      }),
    },
    header: {
      padding: 16,
      borderBottomWidth: variant === 'outlined' ? 1 : 0,
      borderBottomColor: '#E5E7EB',
    },
    content: {
      padding: 16,
    },
    footer: {
      padding: 16,
      borderTopWidth: variant === 'outlined' ? 1 : 0,
      borderTopColor: '#E5E7EB',
    },
  });

  const renderContent = () => (
    <>
      {header && (
        <View style={[styles.header, headerStyle]} testID={`${testID}-header`}>
          {header}
        </View>
      )}
      <View style={[styles.content, contentStyle]} testID={`${testID}-content`}>
        {children}
      </View>
      {footer && (
        <View style={[styles.footer, footerStyle]} testID={`${testID}-footer`}>
          {footer}
        </View>
      )}
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={[styles.container, style]}
        onPress={disabled ? undefined : onPress}
        disabled={disabled}
        testID={testID}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
      >
        {renderContent()}
      </TouchableOpacity>
    );
  }

  return (
    <View
      style={[styles.container, style]}
      testID={testID}
      accessibilityRole="none"
    >
      {renderContent()}
    </View>
  );
}; 