import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from "@/theme/useTheme";

export interface RadioOption {
  /**
   * The label to display next to the radio button
   */
  label: string;
  
  /**
   * The value of this radio option
   */
  value: string | number;
  
  /**
   * Whether this radio option is disabled
   */
  disabled?: boolean;
}

export interface RadioGroupProps {
  /**
   * Array of radio options
   */
  options: RadioOption[];
  
  /**
   * The currently selected value
   */
  value?: string | number;
  
  /**
   * Function called when a radio option is selected
   */
  onChange?: (value: string | number) => void;
  
  /**
   * Label text for the radio group
   */
  label?: string;
  
  /**
   * Whether the radio group is required
   */
  required?: boolean;
  
  /**
   * Error message to display
   */
  error?: string;
  
  /**
   * Helper text to display
   */
  helperText?: string;
  
  /**
   * Orientation of the radio options
   */
  orientation?: 'horizontal' | 'vertical';
  
  /**
   * Whether the radio group is disabled
   */
  disabled?: boolean;
  
  /**
   * The size of the radio buttons
   */
  size?: 'small' | 'medium' | 'large';
  
  /**
   * Additional style for the container
   */
  style?: ViewStyle;
  
  /**
   * Additional style for each radio option container
   */
  optionStyle?: ViewStyle;
  
  /**
   * Additional style for the label text
   */
  labelStyle?: TextStyle;
  
  /**
   * Additional style for each radio option label
   */
  optionLabelStyle?: TextStyle;
  
  /**
   * Test ID for testing
   */
  testID?: string;
}

/**
 * A group of radio buttons for selecting a single option from a list
 */
export const RadioGroup: React.FC<RadioGroupProps> = ({
  options,
  value,
  onChange,
  label,
  required = false,
  error,
  helperText,
  orientation = 'vertical',
  disabled = false,
  size = 'medium',
  style,
  optionStyle,
  labelStyle,
  optionLabelStyle,
  testID = 'radio-group',
}) => {
  const { colors, typography } = useTheme();
  
  const getRadioSize = (): number => {
    switch (size) {
      case 'small':
        return 16;
      case 'large':
        return 24;
      case 'medium':
      default:
        return 20;
    }
  };
  
  const getInnerRadioSize = (): number => {
    switch (size) {
      case 'small':
        return 8;
      case 'large':
        return 14;
      case 'medium':
      default:
        return 12;
    }
  };
  
  const handlePress = (option: RadioOption) => {
    if (disabled || option.disabled) return;
    
    onChange?.(option.value);
  };
  
  return (
    <View style={[styles.container, style]} testID={testID}>
      {label && (
        <Text
          style={[
            styles.label,
            { color: colors.text },
            labelStyle
          ]}
          testID={`${testID}-label`}
        >
          {label}
          {required && <Text style={{ color: colors.error }}> *</Text>}
        </Text>
      )}
      
      <View
        style={[
          styles.optionsContainer,
          { 
            flexDirection: orientation === 'horizontal' ? 'row' : 'column',
            flexWrap: orientation === 'horizontal' ? 'wrap' : 'nowrap',
          }
        ]}
        testID={`${testID}-options`}
      >
        {options.map((option, index) => {
          const isSelected = option.value === value;
          const isDisabled = disabled || option.disabled;
          
          return (
            <TouchableOpacity
              key={`${option.value}-${index}`}
              style={[
                styles.optionContainer,
                orientation === 'horizontal' && styles.horizontalOption,
                isDisabled && styles.disabledOption,
                optionStyle,
              ]}
              onPress={() => handlePress(option)}
              disabled={isDisabled}
              testID={`${testID}-option-${option.value}`}
              accessibilityRole="radio"
              accessibilityState={{ checked: isSelected, disabled: isDisabled }}
            >
              <View
                style={[
                  styles.radio,
                  {
                    width: getRadioSize(),
                    height: getRadioSize(),
                    borderColor: isDisabled 
                      ? colors.text + '40' 
                      : isSelected 
                        ? colors.primary 
                        : colors.text,
                  }
                ]}
                testID={`${testID}-radio-${option.value}`}
              >
                {isSelected && (
                  <View
                    style={[
                      styles.radioInner,
                      {
                        width: getInnerRadioSize(),
                        height: getInnerRadioSize(),
                        backgroundColor: isDisabled ? colors.text + '40' : colors.primary,
                      }
                    ]}
                    testID={`${testID}-radio-inner-${option.value}`}
                  />
                )}
              </View>
              
              <Text
                style={[
                  styles.optionLabel,
                  { 
                    color: isDisabled ? colors.text + '40' : colors.text,
                    fontSize: typography.fontSize.bodyMedium,
                  },
                  optionLabelStyle
                ]}
                testID={`${testID}-option-label-${option.value}`}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      
      {error && (
        <Text
          style={[styles.errorText, { color: colors.error }]}
          testID={`${testID}-error`}
        >
          {error}
        </Text>
      )}
      
      {helperText && !error && (
        <Text
          style={[styles.helperText, { color: colors.text + '80' }]}
          testID={`${testID}-helper-text`}
        >
          {helperText}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontWeight: '500',
  },
  optionsContainer: {
    marginBottom: 4,
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  horizontalOption: {
    marginRight: 16,
  },
  disabledOption: {
    opacity: 0.6,
  },
  radio: {
    borderWidth: 2,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    borderRadius: 999,
  },
  optionLabel: {
    marginLeft: 8,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
  },
}); 