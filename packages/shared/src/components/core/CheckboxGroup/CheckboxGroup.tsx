import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from "@/theme/useTheme";
import { Checkbox } from '../Checkbox';

export interface CheckboxOption {
  id: string;
  label: string;
  value: any;
  disabled?: boolean;
}

export interface CheckboxGroupProps {
  options: CheckboxOption[];
  value?: string[];
  onChange?: (value: string[]) => void;
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  row?: boolean;
  testID?: string;
  style?: ViewStyle;
}

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  options,
  value = [],
  onChange,
  label,
  error,
  helperText,
  required = false,
  disabled = false,
  row = false,
  testID,
  style,
}) => {
  const theme = useTheme();
  const [selectedValues, setSelectedValues] = useState<string[]>(value || []);

  useEffect(() => {
    setSelectedValues(value || []);
  }, [value]);

  const handleValueChange = (optionId: string) => {
    let newValues: string[];
    
    if (selectedValues.includes(optionId)) {
      newValues = selectedValues.filter(id => id !== optionId);
    } else {
      newValues = [...selectedValues, optionId];
    }
    
    setSelectedValues(newValues);
    onChange?.(newValues);
  };

  const styles = StyleSheet.create({
    container: {
      ...style,
    },
    label: {
      fontSize: theme.typography.fontSize.bodyMedium,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 4,
    },
    labelRequired: {
      color: theme.colors.error,
      marginLeft: 2,
    },
    optionsContainer: {
      flexDirection: row ? 'row' : 'column',
      flexWrap: row ? 'wrap' : 'nowrap',
      gap: 8,
    },
    option: {
      marginBottom: row ? 0 : 4,
      marginRight: row ? 16 : 0,
    },
    errorText: {
      fontSize: theme.typography.fontSize.bodySmall,
      color: theme.colors.error,
      marginTop: 4,
    },
    helperText: {
      fontSize: theme.typography.fontSize.bodySmall,
      color: theme.colors.secondary,
      marginTop: 4,
    },
  });

  return (
    <View style={styles.container} testID={testID}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.labelRequired}> *</Text>}
        </Text>
      )}
      
      <View style={styles.optionsContainer}>
        {options.map((option) => (
          <View key={option.id} style={styles.option}>
            <Checkbox
              label={option.label}
              checked={selectedValues.includes(option.id)}
              onPress={() => handleValueChange(option.id)}
              disabled={disabled || option.disabled}
              testID={`checkbox-${option.id}`}
            />
          </View>
        ))}
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
      {helperText && !error && <Text style={styles.helperText}>{helperText}</Text>}
    </View>
  );
}; 