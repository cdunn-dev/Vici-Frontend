import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { DatePicker } from '../DatePicker';

// Mock the useTheme hook
jest.mock('../../../../hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      primary: '#5224EF',
      text: '#11182C',
      background: '#FFFFFF',
    },
  }),
}));

// Mock the DateTimePicker component
jest.mock('@react-native-community/datetimepicker', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: ({ value, onChange }: any) => (
      <View
        testID="mock-date-picker"
        onPress={() => onChange({}, new Date('2023-01-01'))}
      />
    ),
  };
});

describe('DatePicker', () => {
  const onChange = jest.fn();

  beforeEach(() => {
    onChange.mockClear();
  });

  it('renders correctly with default props', () => {
    const { getByTestId } = render(
      <DatePicker testID="date-picker" />
    );
    const datePicker = getByTestId('date-picker');
    expect(datePicker).toBeTruthy();
  });

  it('renders with label', () => {
    const { getByTestId } = render(
      <DatePicker label="Select Date" testID="date-picker" />
    );
    const label = getByTestId('date-picker-label');
    expect(label).toBeTruthy();
  });

  it('renders with placeholder', () => {
    const { getByTestId } = render(
      <DatePicker placeholder="Choose date" testID="date-picker" />
    );
    const value = getByTestId('date-picker-value');
    expect(value.props.children).toBe('Choose date');
  });

  it('renders with selected date', () => {
    const date = new Date('2023-01-01');
    const { getByTestId } = render(
      <DatePicker value={date} testID="date-picker" />
    );
    const value = getByTestId('date-picker-value');
    expect(value.props.children).toBe('Jan 1, 2023');
  });

  it('handles date selection', () => {
    const { getByTestId } = render(
      <DatePicker onChange={onChange} testID="date-picker" />
    );
    const input = getByTestId('date-picker-input');
    fireEvent.press(input);
    const picker = getByTestId('mock-date-picker');
    fireEvent.press(picker);
    expect(onChange).toHaveBeenCalledWith(new Date('2023-01-01'));
  });

  it('renders in disabled state', () => {
    const { getByTestId } = render(
      <DatePicker disabled testID="date-picker" />
    );
    const input = getByTestId('date-picker-input');
    expect(input.props.disabled).toBe(true);
  });

  it('applies custom styles', () => {
    const customStyle = { margin: 10 };
    const { getByTestId } = render(
      <DatePicker style={customStyle} testID="date-picker" />
    );
    const datePicker = getByTestId('date-picker');
    expect(datePicker.props.style).toEqual(
      expect.objectContaining(customStyle)
    );
  });

  it('handles minimum and maximum dates', () => {
    const minDate = new Date('2023-01-01');
    const maxDate = new Date('2023-12-31');
    const { getByTestId } = render(
      <DatePicker
        minimumDate={minDate}
        maximumDate={maxDate}
        testID="date-picker"
      />
    );
    const input = getByTestId('date-picker-input');
    fireEvent.press(input);
    const picker = getByTestId('mock-date-picker');
    expect(picker).toBeTruthy();
  });
}); 