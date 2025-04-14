import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { Checkbox } from '../../core/Checkbox';

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

  const handleValueChange = (optionId: string, isChecked: boolean) => {
    let newValues: string[];
    
    if (isChecked) {
      newValues = [...selectedValues, optionId];
    } else {
      newValues = selectedValues.filter(id => id !== optionId);
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
      marginBottom: theme.spacing.xs,
    },
    labelRequired: {
      color: theme.colors.error,
      marginLeft: 2,
    },
    optionsContainer: {
      flexDirection: row ? 'row' : 'column',
      flexWrap: row ? 'wrap' : 'nowrap',
      gap: theme.spacing.sm,
    },
    option: {
      marginBottom: row ? 0 : theme.spacing.xs,
      marginRight: row ? theme.spacing.md : 0,
    },
    errorText: {
      fontSize: theme.typography.fontSize.bodySmall,
      color: theme.colors.error,
      marginTop: theme.spacing.xs,
    },
    helperText: {
      fontSize: theme.typography.fontSize.bodySmall,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.xs,
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
              onChange={(isChecked) => handleValueChange(option.id, isChecked)}
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