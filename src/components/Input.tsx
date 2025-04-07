import React from 'react';
import { TextInput, View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export interface InputProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  disabled?: boolean;
}

export const Input: React.FC<InputProps> = ({
  placeholder,
  value,
  onChangeText,
  error,
  disabled = false,
}) => {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <TextInput
        style={[
          styles.input,
          { borderColor: error ? theme.colors.error : theme.colors.border },
          disabled && styles.disabled,
        ]}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        editable={!disabled}
      />
      {error && (
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  disabled: {
    opacity: 0.5,
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
});

export default Input;