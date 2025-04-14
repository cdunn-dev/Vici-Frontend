import React from 'react';
import { StyleSheet, View, ViewStyle, TextStyle, Pressable, Text } from 'react-native';
import { useTheme } from "@/theme/useTheme";
import { Icon } from '../Icon';

export interface RadioProps {
  /** Whether the radio is selected */
  selected: boolean;
  /** Callback when the radio state changes */
  onPress: () => void;
  /** Label text for the radio */
  label?: string;
  /** Whether the radio is disabled */
  disabled?: boolean;
  /** Size of the radio */
  size?: 'small' | 'medium' | 'large';
  /** Additional styles for the container */
  style?: ViewStyle;
  /** Additional styles for the label */
  labelStyle?: TextStyle;
  /** Test ID for testing */
  testID?: string;
}

const RADIO_SIZES = {
  small: 16,
  medium: 20,
  large: 24,
};

/**
 * A reusable radio component with label support
 */
export const Radio: React.FC<RadioProps> = ({
  selected,
  onPress,
  label,
  disabled = false,
  size = 'medium',
  style,
  labelStyle,
  testID = 'radio',
}) => {
  const theme = useTheme();
  const radioSize = RADIO_SIZES[size];

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      opacity: disabled ? 0.5 : 1,
      ...style,
    },
    radio: {
      width: radioSize,
      height: radioSize,
      borderRadius: radioSize / 2,
      borderWidth: 2,
      borderColor: selected ? theme.colors.primary : theme.colors.text,
      backgroundColor: selected ? theme.colors.primary : 'transparent',
      justifyContent: 'center',
      alignItems: 'center',
    },
    radioDot: {
      width: radioSize - 8,
      height: radioSize - 8,
      borderRadius: (radioSize - 8) / 2,
      backgroundColor: theme.colors.background,
    },
    label: {
      marginLeft: 8,
      color: theme.colors.text,
      fontSize: theme.typography.fontSize.bodyMedium,
      ...labelStyle,
    },
  });

  return (
    <Pressable
      style={styles.container}
      onPress={onPress}
      disabled={disabled}
      testID={testID}
    >
      <View style={styles.radio}>
        {selected && <View style={styles.radioDot} />}
      </View>
      {label && <Text style={styles.label}>{label}</Text>}
    </Pressable>
  );
}; 