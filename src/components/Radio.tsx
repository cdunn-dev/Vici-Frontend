import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { theme } from '../utils/theme';
import Icon from './Icon';

interface RadioProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  style?: ViewStyle;
}

const Radio = ({ value, onValueChange, disabled = false, style }: RadioProps) => {
  return (
    <TouchableOpacity
      onPress={() => !disabled && onValueChange(!value)}
      disabled={disabled}
      style={[styles.container, style]}
    >
      <View
        style={[
          styles.radio,
          value && styles.checked,
          disabled && styles.disabled,
        ]}
      >
        {value && (
          <View style={styles.innerCircle} />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checked: {
    borderColor: theme.colors.primary,
  },
  innerCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.primary,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default Radio; 