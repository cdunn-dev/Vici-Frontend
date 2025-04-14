import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  ScrollView,
} from 'react-native';
import { useTheme } from "@/theme/useTheme";
import { Icon } from '../Icon';

export interface FilterOption {
  id: string;
  label: string;
  value: any;
}

export interface FilterProps {
  options: FilterOption[];
  selected?: string[];
  onSelect?: (selected: string[]) => void;
  multiSelect?: boolean;
  style?: ViewStyle;
  label?: string;
  showClearButton?: boolean;
  testID?: string;
}

export const Filter: React.FC<FilterProps> = ({
  options,
  selected = [],
  onSelect,
  multiSelect = false,
  style,
  label,
  showClearButton = true,
  testID,
}) => {
  const theme = useTheme();
  const [selectedOptions, setSelectedOptions] = useState<string[]>(selected);

  const handleOptionPress = useCallback(
    (optionId: string) => {
      let newSelected: string[];
      if (multiSelect) {
        if (selectedOptions.includes(optionId)) {
          newSelected = selectedOptions.filter((id) => id !== optionId);
        } else {
          newSelected = [...selectedOptions, optionId];
        }
      } else {
        newSelected = selectedOptions.includes(optionId) ? [] : [optionId];
      }
      setSelectedOptions(newSelected);
      onSelect?.(newSelected);
    },
    [multiSelect, onSelect, selectedOptions]
  );

  const handleClear = useCallback(() => {
    setSelectedOptions([]);
    onSelect?.([]);
  }, [onSelect]);

  const styles = StyleSheet.create({
    container: {
      ...style,
    },
    label: {
      fontSize: theme.typography.fontSize.bodyMedium,
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    optionsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.backgroundSecondary,
    },
    optionSelected: {
      backgroundColor: theme.colors.primary,
    },
    optionText: {
      fontSize: theme.typography.fontSize.bodyMedium,
      color: theme.colors.text,
    },
    optionTextSelected: {
      color: theme.colors.background,
    },
    clearButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.spacing.sm,
      padding: theme.spacing.sm,
    },
    clearButtonText: {
      fontSize: theme.typography.fontSize.bodySmall,
      color: theme.colors.textSecondary,
      marginLeft: theme.spacing.xs,
    },
  });

  return (
    <View style={styles.container} testID={testID}>
      {label && <Text style={styles.label}>{label}</Text>}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.optionsContainer}
      >
        {options.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.option,
              selectedOptions.includes(option.id) && styles.optionSelected,
            ]}
            onPress={() => handleOptionPress(option.id)}
          >
            <Text
              style={[
                styles.optionText,
                selectedOptions.includes(option.id) && styles.optionTextSelected,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {showClearButton && selectedOptions.length > 0 && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={handleClear}
          testID="clear-button"
        >
          <Icon name="close" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.clearButtonText}>Clear</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}; 