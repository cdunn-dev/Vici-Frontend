import React, { useState, useCallback } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextInputProps,
} from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { Icon } from '../Icon';

export interface SearchProps extends Omit<TextInputProps, 'style'> {
  onSearch?: (query: string) => void;
  placeholder?: string;
  style?: ViewStyle;
  showClearButton?: boolean;
  autoFocus?: boolean;
  debounceTime?: number;
}

export const Search: React.FC<SearchProps> = ({
  onSearch,
  placeholder = 'Search...',
  style,
  showClearButton = true,
  autoFocus = false,
  debounceTime = 300,
  ...props
}) => {
  const theme = useTheme();
  const [query, setQuery] = useState('');
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout>();

  const handleSearch = useCallback(
    (text: string) => {
      setQuery(text);
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      const timer = setTimeout(() => {
        onSearch?.(text);
      }, debounceTime);
      setDebounceTimer(timer);
    },
    [debounceTime, debounceTimer, onSearch]
  );

  const handleClear = useCallback(() => {
    setQuery('');
    onSearch?.('');
  }, [onSearch]);

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.backgroundSecondary,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.md,
      ...style,
    },
    input: {
      flex: 1,
      height: 40,
      color: theme.colors.text,
      fontSize: theme.typography.fontSize.bodyMedium,
    },
    clearButton: {
      padding: theme.spacing.xs,
    },
  });

  return (
    <View style={styles.container}>
      <Icon name="search" size={20} color={theme.colors.textSecondary} />
      <TextInput
        style={styles.input}
        value={query}
        onChangeText={handleSearch}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textSecondary}
        autoFocus={autoFocus}
        {...props}
      />
      {showClearButton && query.length > 0 && (
        <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
          <Icon name="close" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );
}; 