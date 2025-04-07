import React from 'react';
import { View, StyleSheet, Switch as RNSwitch, ViewStyle } from 'react-native';
import { theme } from '../utils/theme';

interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  style?: ViewStyle;
}

const Switch = ({ value, onValueChange, disabled = false, style }: SwitchProps) => {
  return (
    <View style={[styles.container, style]}>
      <RNSwitch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{
          false: theme.colors.border,
          true: theme.colors.primary,
        }}
        thumbColor={theme.colors.background}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Switch; 