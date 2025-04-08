import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  ViewStyle,
  TextStyle,
  Pressable,
} from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { Icon } from '../Icon';

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps {
  /** Currently selected value */
  value?: string;
  /** Callback when selection changes */
  onChange: (value: string) => void;
  /** Array of options to display */
  options: SelectOption[];
  /** Placeholder text when no value is selected */
  placeholder?: string;
  /** Whether the select is disabled */
  disabled?: boolean;
  /** Size of the select */
  size?: 'small' | 'medium' | 'large';
  /** Additional styles for the container */
  style?: ViewStyle;
  /** Additional styles for the text */
  textStyle?: TextStyle;
  /** Test ID for testing */
  testID?: string;
}

const SELECT_SIZES = {
  small: {
    height: 32,
    fontSize: 12,
    padding: 8,
  },
  medium: {
    height: 40,
    fontSize: 14,
    padding: 12,
  },
  large: {
    height: 48,
    fontSize: 16,
    padding: 16,
  },
};

/**
 * A reusable select component with dropdown functionality
 */
export const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  disabled = false,
  size = 'medium',
  style,
  textStyle,
  testID = 'select',
}) => {
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(option => option.value === value);

  const styles = StyleSheet.create({
    container: {
      position: 'relative',
      ...style,
    },
    select: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: SELECT_SIZES[size].height,
      paddingHorizontal: SELECT_SIZES[size].padding,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.text,
      backgroundColor: theme.colors.background,
      opacity: disabled ? 0.5 : 1,
    },
    text: {
      color: selectedOption ? theme.colors.text : theme.colors.text + '80',
      fontSize: SELECT_SIZES[size].fontSize,
      ...textStyle,
    },
    modal: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    optionsContainer: {
      width: '80%',
      maxHeight: '60%',
      backgroundColor: theme.colors.background,
      borderRadius: 8,
      padding: 8,
    },
    option: {
      padding: SELECT_SIZES[size].padding,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.text + '20',
    },
    optionText: {
      color: theme.colors.text,
      fontSize: SELECT_SIZES[size].fontSize,
    },
    selectedOption: {
      backgroundColor: theme.colors.primary + '20',
    },
  });

  const handleSelect = (option: SelectOption) => {
    onChange(option.value);
    setIsOpen(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.select}
        onPress={() => !disabled && setIsOpen(true)}
        disabled={disabled}
        testID={testID}
      >
        <Text style={styles.text}>
          {selectedOption?.label || placeholder}
        </Text>
        <Icon
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={SELECT_SIZES[size].fontSize}
          color={theme.colors.text}
        />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable
          style={styles.modal}
          onPress={() => setIsOpen(false)}
        >
          <View style={styles.optionsContainer}>
            <FlatList
              data={options}
              keyExtractor={item => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.option,
                    item.value === value && styles.selectedOption,
                  ]}
                  onPress={() => handleSelect(item)}
                >
                  <Text style={styles.optionText}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}; 