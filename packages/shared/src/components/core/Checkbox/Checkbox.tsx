import React from 'react';
import { StyleSheet, View, ViewStyle, TextStyle, Pressable, Text } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { Icon } from '../Icon';

export interface CheckboxProps {
  /** Whether the checkbox is checked */
  checked: boolean;
  /** Callback when the checkbox state changes */
  onPress: () => void;
  /** Label text for the checkbox */
  label?: string;
  /** Whether the checkbox is disabled */
  disabled?: boolean;
  /** Size of the checkbox */
  size?: 'small' | 'medium' | 'large';
  /** Additional styles for the container */
  style?: ViewStyle;
  /** Additional styles for the label */
  labelStyle?: TextStyle;
  /** Test ID for testing */
  testID?: string;
}

const CHECKBOX_SIZES = {
  small: 16,
  medium: 20,
  large: 24,
};

/**
 * A reusable checkbox component with label support
 */
export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onPress,
  label,
  disabled = false,
  size = 'medium',
  style,
  labelStyle,
  testID = 'checkbox',
}) => {
  const theme = useTheme();
  const checkboxSize = CHECKBOX_SIZES[size];

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      opacity: disabled ? 0.5 : 1,
      ...style,
    },
    checkbox: {
      width: checkboxSize,
      height: checkboxSize,
      borderRadius: 4,
      borderWidth: 2,
      borderColor: checked ? theme.colors.primary : theme.colors.text,
      backgroundColor: checked ? theme.colors.primary : 'transparent',
      justifyContent: 'center',
      alignItems: 'center',
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
      <View style={styles.checkbox}>
        {checked && (
          <Icon
            name="check"
            size={checkboxSize - 8}
            color={theme.colors.background}
            family="material"
          />
        )}
      </View>
      {label && <Text style={styles.label}>{label}</Text>}
    </Pressable>
  );
}; 