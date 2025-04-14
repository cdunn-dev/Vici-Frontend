import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useTheme } from "@/theme/useTheme";

export interface ChipProps {
  label: string;
  onPress?: () => void;
  selected?: boolean;
  disabled?: boolean;
  color?: string;
  style?: any;
  testID?: string;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  onPress,
  selected = false,
  disabled = false,
  color,
  style,
  testID = 'chip',
}) => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      backgroundColor: selected ? (color || theme.colors.primary) : theme.colors.background,
      borderWidth: 1,
      borderColor: selected ? (color || theme.colors.primary) : theme.colors.text,
      opacity: disabled ? 0.5 : 1,
      ...style,
    },
    label: {
      color: selected ? theme.colors.background : theme.colors.text,
      fontSize: 14,
      fontWeight: '500',
    },
  });

  const content = (
    <View style={styles.chip}>
      <Text style={styles.label}>{label}</Text>
    </View>
  );

  if (onPress && !disabled) {
    return (
      <TouchableOpacity
        onPress={onPress}
        testID={testID}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <View testID={testID}>
      {content}
    </View>
  );
}; 