import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Search } from '../Search';
import { useTheme } from "@/theme/useTheme";

// Mock the useTheme hook
jest.mock('../../../../hooks/useTheme', () => ({
  useTheme: jest.fn(),
}));

describe('Search', () => {
  const mockTheme = {
    colors: {
      primary: '#007AFF',
      secondary: '#5856D6',
      accent: '#FF9500',
      success: '#34C759',
      error: '#FF3B30',
      warning: '#FFCC00',
      background: '#FFFFFF',
      backgroundSecondary: '#F2F2F7',
      text: '#000000',
      textSecondary: '#8E8E93',
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
    },
    typography: {
      fontSize: {
        bodySmall: 12,
        bodyMedium: 14,
        bodyLarge: 16,
      },
    },
    borderRadius: {
      sm: 4,
      md: 8,
      lg: 12,
      full: 9999,
    },
  };

  beforeEach(() => {
    (useTheme as jest.Mock).mockReturnValue(mockTheme);
  });

  it('renders correctly with default props', () => {
    const { getByPlaceholderText } = render(
      <Search placeholder="Search..." />
    );

    expect(getByPlaceholderText('Search...')).toBeTruthy();
  });

  it('calls onSearch with debounce', () => {
    jest.useFakeTimers();
    const onSearch = jest.fn();
    const { getByPlaceholderText } = render(
      <Search onSearch={onSearch} placeholder="Search..." />
    );

    fireEvent.changeText(getByPlaceholderText('Search...'), 'test');
    expect(onSearch).not.toHaveBeenCalled();

    jest.advanceTimersByTime(300);
    expect(onSearch).toHaveBeenCalledWith('test');
  });

  it('clears search when clear button is pressed', () => {
    const onSearch = jest.fn();
    const { getByPlaceholderText, getByTestId } = render(
      <Search onSearch={onSearch} placeholder="Search..." />
    );

    const input = getByPlaceholderText('Search...');
    fireEvent.changeText(input, 'test');
    fireEvent.press(getByTestId('clear-button'));

    expect(input.props.value).toBe('');
    expect(onSearch).toHaveBeenCalledWith('');
  });

  it('hides clear button when showClearButton is false', () => {
    const { getByPlaceholderText, queryByTestId } = render(
      <Search showClearButton={false} placeholder="Search..." />
    );

    fireEvent.changeText(getByPlaceholderText('Search...'), 'test');
    expect(queryByTestId('clear-button')).toBeNull();
  });

  it('applies custom styles', () => {
    const customStyle = { marginTop: 20 };
    const { getByTestId } = render(
      <Search style={customStyle} testID="search-container" />
    );

    expect(getByTestId('search-container').props.style).toContainEqual(customStyle);
  });

  it('forwards TextInput props', () => {
    const { getByPlaceholderText } = render(
      <Search
        placeholder="Search..."
        autoCapitalize="none"
        keyboardType="email-address"
      />
    );

    const input = getByPlaceholderText('Search...');
    expect(input.props.autoCapitalize).toBe('none');
    expect(input.props.keyboardType).toBe('email-address');
  });
}); 