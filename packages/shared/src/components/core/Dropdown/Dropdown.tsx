import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  FlatList,
  ViewStyle,
  TextStyle,
  Dimensions,
  TouchableWithoutFeedback,
  Animated,
} from 'react-native';
import { useTheme } from "@/theme/useTheme";
import { Icon } from '../Icon';

export interface DropdownOption {
  label: string;
  value: string | number;
  icon?: string;
  disabled?: boolean;
}

export interface DropdownProps {
  /**
   * Options to display in the dropdown
   */
  options: DropdownOption[];
  /**
   * Selected value
   */
  value?: string | number;
  /**
   * Callback when value changes
   */
  onValueChange?: (value: string | number) => void;
  /**
   * Label text
   */
  label?: string;
  /**
   * Placeholder text when no option is selected
   */
  placeholder?: string;
  /**
   * Whether the dropdown is disabled
   */
  disabled?: boolean;
  /**
   * Whether the dropdown is required
   */
  required?: boolean;
  /**
   * Error message
   */
  error?: string;
  /**
   * Helper text
   */
  helperText?: string;
  /**
   * Additional styles for the container
   */
  style?: ViewStyle;
  /**
   * Additional styles for the dropdown button
   */
  buttonStyle?: ViewStyle;
  /**
   * Additional styles for the dropdown menu
   */
  menuStyle?: ViewStyle;
  /**
   * Additional styles for option items
   */
  optionStyle?: ViewStyle;
  /**
   * Additional styles for the selected option
   */
  selectedOptionStyle?: ViewStyle;
  /**
   * Additional styles for the label text
   */
  labelStyle?: TextStyle;
  /**
   * Additional styles for option text
   */
  optionTextStyle?: TextStyle;
  /**
   * Test ID for the component
   */
  testID?: string;
}

/**
 * A dropdown component for selecting one option from a list
 */
export const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  onValueChange,
  label,
  placeholder = 'Select an option',
  disabled = false,
  required = false,
  error,
  helperText,
  style,
  buttonStyle,
  menuStyle,
  optionStyle,
  selectedOptionStyle,
  labelStyle,
  optionTextStyle,
  testID = 'dropdown',
}) => {
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [buttonLayout, setButtonLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [menuHeight, setMenuHeight] = useState(0);
  const buttonRef = useRef<TouchableOpacity>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  const selectedOption = options.find(option => option.value === value);
  
  useEffect(() => {
    if (isOpen) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [isOpen, fadeAnim]);

  const handleToggle = () => {
    if (disabled) return;
    
    if (!isOpen) {
      buttonRef.current?.measure((x, y, width, height, pageX, pageY) => {
        setButtonLayout({ x: pageX, y: pageY, width, height });
        setIsOpen(true);
      });
    } else {
      setIsOpen(false);
    }
  };

  const handleSelect = (option: DropdownOption) => {
    if (option.disabled) return;
    
    setIsOpen(false);
    onValueChange?.(option.value);
  };

  const handleOutsidePress = () => {
    setIsOpen(false);
  };

  const calculateMenuHeight = () => {
    const windowHeight = Dimensions.get('window').height;
    const spaceBelow = windowHeight - buttonLayout.y - buttonLayout.height;
    const spaceAbove = buttonLayout.y;
    const maxMenuHeight = Math.min(options.length * 48, 250);
    
    // If there's not enough space below, show menu above
    if (spaceBelow < maxMenuHeight && spaceAbove > maxMenuHeight) {
      return -maxMenuHeight;
    }
    
    return Math.min(maxMenuHeight, spaceBelow);
  };

  useEffect(() => {
    if (isOpen) {
      setMenuHeight(calculateMenuHeight());
    }
  }, [isOpen, buttonLayout]);

  const styles = StyleSheet.create({
    container: {
      ...style,
    },
    label: {
      fontSize: theme.typography.fontSize.bodyMedium,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 4,
      ...labelStyle,
    },
    labelRequired: {
      color: theme.colors.error,
      marginLeft: 2,
    },
    buttonContainer: {
      borderWidth: 1,
      borderColor: error ? theme.colors.error : theme.colors.secondary,
      borderRadius: 8,
      padding: 12,
      backgroundColor: disabled ? '#F5F5F5' : theme.colors.background,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      opacity: disabled ? 0.5 : 1,
      ...buttonStyle,
    },
    buttonText: {
      flex: 1,
      fontSize: theme.typography.fontSize.bodyMedium,
      color: selectedOption ? theme.colors.text : '#8F8F8F',
    },
    iconContainer: {
      marginLeft: 8,
    },
    menuContainer: {
      position: 'absolute',
      left: buttonLayout.x,
      top: buttonLayout.y + buttonLayout.height,
      width: buttonLayout.width,
      backgroundColor: theme.colors.background,
      borderRadius: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
      ...menuStyle,
      zIndex: 1000,
    },
    optionContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      ...optionStyle,
    },
    selectedOptionContainer: {
      backgroundColor: '#F5F7FF',
      ...selectedOptionStyle,
    },
    disabledOption: {
      opacity: 0.5,
    },
    optionText: {
      fontSize: theme.typography.fontSize.bodyMedium,
      color: theme.colors.text,
      marginLeft: 8,
      ...optionTextStyle,
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
    modalOverlay: {
      flex: 1,
      backgroundColor: 'transparent',
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
      
      <TouchableOpacity
        ref={buttonRef}
        style={styles.buttonContainer}
        onPress={handleToggle}
        disabled={disabled}
        testID={`${testID}-button`}
      >
        <Text style={styles.buttonText} numberOfLines={1}>
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <View style={styles.iconContainer}>
          <Icon
            name={isOpen ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={theme.colors.secondary}
          />
        </View>
      </TouchableOpacity>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
      {helperText && !error && <Text style={styles.helperText}>{helperText}</Text>}
      
      <Modal
        visible={isOpen}
        transparent
        animationType="none"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableWithoutFeedback onPress={handleOutsidePress}>
          <View style={styles.modalOverlay}>
            <Animated.View
              style={[
                styles.menuContainer,
                {
                  opacity: fadeAnim,
                  maxHeight: Math.abs(menuHeight),
                  transform: [
                    { translateY: menuHeight < 0 ? -buttonLayout.height - Math.abs(menuHeight) : 0 }
                  ],
                },
              ]}
            >
              <ScrollView bounces={false} testID={`${testID}-menu`}>
                {options.map((option, index) => (
                  <TouchableOpacity
                    key={`${option.value}-${index}`}
                    style={[
                      styles.optionContainer,
                      option.value === value && styles.selectedOptionContainer,
                      option.disabled && styles.disabledOption,
                    ]}
                    onPress={() => handleSelect(option)}
                    disabled={option.disabled}
                    testID={`${testID}-option-${option.value}`}
                  >
                    {option.icon && (
                      <Icon
                        name={option.icon}
                        size={16}
                        color={theme.colors.text}
                      />
                    )}
                    <Text style={styles.optionText} numberOfLines={1}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}; 