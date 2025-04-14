import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
  Modal,
  Platform,
} from 'react-native';
import { useTheme } from "@/theme/useTheme";
import { Text } from '../Text';
import { Icon } from '../Icon';
import DateTimePicker from '@react-native-community/datetimepicker';

export interface DatePickerProps {
  /** Selected date */
  value?: Date;
  /** Callback when date changes */
  onChange?: (date: Date) => void;
  /** Label for the date picker */
  label?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Whether the date picker is disabled */
  disabled?: boolean;
  /** Minimum date that can be selected */
  minimumDate?: Date;
  /** Maximum date that can be selected */
  maximumDate?: Date;
  /** Format for displaying the date */
  format?: string;
  /** Additional styles for the container */
  style?: ViewStyle;
  /** Additional styles for the input */
  inputStyle?: ViewStyle;
  /** Additional styles for the label */
  labelStyle?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}

/**
 * A reusable date picker component
 */
export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  label,
  placeholder = 'Select date',
  disabled = false,
  minimumDate,
  maximumDate,
  format = 'MMM d, yyyy',
  style,
  inputStyle,
  labelStyle,
  testID = 'date-picker',
}) => {
  const theme = useTheme();
  const [showPicker, setShowPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(value || new Date());

  const handleDateChange = (event: any, date?: Date) => {
    setShowPicker(false);
    if (date) {
      setSelectedDate(date);
      onChange?.(date);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const styles = StyleSheet.create({
    container: {
      width: '100%',
      ...style,
    },
    label: {
      marginBottom: 8,
      color: theme.colors.text,
      ...labelStyle,
    },
    input: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 12,
      borderWidth: 1,
      borderColor: theme.colors.text + '20',
      borderRadius: 8,
      backgroundColor: theme.colors.background,
      ...inputStyle,
    },
    inputText: {
      color: value ? theme.colors.text : theme.colors.text + '80',
    },
    disabled: {
      opacity: 0.5,
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      backgroundColor: theme.colors.background,
      borderRadius: 8,
      padding: 16,
      width: '80%',
    },
  });

  if (Platform.OS === 'ios') {
    return (
      <View style={styles.container} testID={testID}>
        {label && (
          <Text style={styles.label} testID={`${testID}-label`}>
            {label}
          </Text>
        )}
        <TouchableOpacity
          style={[styles.input, disabled && styles.disabled]}
          onPress={() => !disabled && setShowPicker(true)}
          disabled={disabled}
          testID={`${testID}-input`}
        >
          <Text style={styles.inputText} testID={`${testID}-value`}>
            {value ? formatDate(value) : placeholder}
          </Text>
          <Icon name="calendar" size={20} color={theme.colors.text} />
        </TouchableOpacity>
        <Modal
          visible={showPicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowPicker(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                testID={`${testID}-picker`}
              />
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  return (
    <View style={styles.container} testID={testID}>
      {label && (
        <Text style={styles.label} testID={`${testID}-label`}>
          {label}
        </Text>
      )}
      <TouchableOpacity
        style={[styles.input, disabled && styles.disabled]}
        onPress={() => !disabled && setShowPicker(true)}
        disabled={disabled}
        testID={`${testID}-input`}
      >
        <Text style={styles.inputText} testID={`${testID}-value`}>
          {value ? formatDate(value) : placeholder}
        </Text>
        <Icon name="calendar" size={20} color={theme.colors.text} />
      </TouchableOpacity>
      {showPicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          testID={`${testID}-picker`}
        />
      )}
    </View>
  );
}; 