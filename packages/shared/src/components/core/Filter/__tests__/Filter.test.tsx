import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Filter } from '../Filter';
import { useTheme } from "@/theme/useTheme";

// Mock the useTheme hook
jest.mock('../../../../hooks/useTheme', () => ({
  useTheme: jest.fn(),
}));

describe('Filter', () => {
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

  const mockOptions = [
    { id: '1', label: 'Option 1', value: 'value1' },
    { id: '2', label: 'Option 2', value: 'value2' },
    { id: '3', label: 'Option 3', value: 'value3' },
  ];

  beforeEach(() => {
    (useTheme as jest.Mock).mockReturnValue(mockTheme);
  });

  it('renders correctly with default props', () => {
    const { getByText } = render(<Filter options={mockOptions} />);

    expect(getByText('Option 1')).toBeTruthy();
    expect(getByText('Option 2')).toBeTruthy();
    expect(getByText('Option 3')).toBeTruthy();
  });

  it('handles single selection', () => {
    const onSelect = jest.fn();
    const { getByText } = render(
      <Filter options={mockOptions} onSelect={onSelect} />
    );

    fireEvent.press(getByText('Option 1'));
    expect(onSelect).toHaveBeenCalledWith(['1']);

    fireEvent.press(getByText('Option 2'));
    expect(onSelect).toHaveBeenCalledWith(['2']);
  });

  it('handles multi-selection', () => {
    const onSelect = jest.fn();
    const { getByText } = render(
      <Filter options={mockOptions} onSelect={onSelect} multiSelect />
    );

    fireEvent.press(getByText('Option 1'));
    expect(onSelect).toHaveBeenCalledWith(['1']);

    fireEvent.press(getByText('Option 2'));
    expect(onSelect).toHaveBeenCalledWith(['1', '2']);

    fireEvent.press(getByText('Option 1'));
    expect(onSelect).toHaveBeenCalledWith(['2']);
  });

  it('shows label when provided', () => {
    const { getByText } = render(
      <Filter options={mockOptions} label="Filter by" />
    );

    expect(getByText('Filter by')).toBeTruthy();
  });

  it('shows clear button when options are selected', () => {
    const { getByText, queryByText } = render(
      <Filter options={mockOptions} selected={['1']} />
    );

    expect(getByText('Clear')).toBeTruthy();

    fireEvent.press(getByText('Clear'));
    expect(queryByText('Clear')).toBeNull();
  });

  it('hides clear button when showClearButton is false', () => {
    const { getByText, queryByText } = render(
      <Filter
        options={mockOptions}
        selected={['1']}
        showClearButton={false}
      />
    );

    fireEvent.press(getByText('Option 1'));
    expect(queryByText('Clear')).toBeNull();
  });

  it('applies custom styles', () => {
    const customStyle = { marginTop: 20 };
    const { getByTestId } = render(
      <Filter options={mockOptions} style={customStyle} testID="filter-container" />
    );

    expect(getByTestId('filter-container').props.style).toContainEqual(customStyle);
  });
}); 