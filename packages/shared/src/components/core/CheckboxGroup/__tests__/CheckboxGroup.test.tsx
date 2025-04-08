import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CheckboxGroup } from '../CheckboxGroup';

// Mock the theme hook
jest.mock('../../../../hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      primary: '#5224EF',
      secondary: '#4318C9',
      accent: '#E0D8FD',
      success: '#16A34A',
      error: '#DC2626',
      warning: '#F59E0B',
      background: '#FFFFFF',
      text: '#11182C',
    },
    typography: {
      fontSize: {
        displayLarge: 24,
        displayMedium: 20,
        displaySmall: 18,
        bodyLarge: 16,
        bodyMedium: 14,
        bodySmall: 12,
        label: 12,
      },
    },
  }),
}));

// Mock the Checkbox component
jest.mock('../../../../components/core/Checkbox', () => ({
  Checkbox: ({ label, checked, onPress, disabled, testID }: { label: string; checked: boolean; onPress: () => void; disabled?: boolean; testID: string }) => (
    <div 
      onClick={onPress} 
      data-testid={testID}
      data-checked={checked}
      data-disabled={disabled}
    >
      {label}
    </div>
  ),
}));

describe('CheckboxGroup Component', () => {
  const mockOptions = [
    { id: '1', label: 'Option 1', value: 'option1' },
    { id: '2', label: 'Option 2', value: 'option2' },
    { id: '3', label: 'Option 3', value: 'option3' },
  ];

  it('renders with default props', () => {
    const { getByTestId, getAllByText } = render(
      <CheckboxGroup options={mockOptions} />
    );

    expect(getAllByText(/Option \d/).length).toBe(3);
    expect(getByTestId('checkbox-1')).toBeTruthy();
    expect(getByTestId('checkbox-2')).toBeTruthy();
    expect(getByTestId('checkbox-3')).toBeTruthy();
  });

  it('renders with selected values', () => {
    const { getByTestId } = render(
      <CheckboxGroup options={mockOptions} value={['1', '3']} />
    );

    expect(getByTestId('checkbox-1').getAttribute('data-checked')).toBe('true');
    expect(getByTestId('checkbox-2').getAttribute('data-checked')).toBe('false');
    expect(getByTestId('checkbox-3').getAttribute('data-checked')).toBe('true');
  });

  it('calls onChange when an option is clicked', () => {
    const handleChange = jest.fn();
    const { getByTestId } = render(
      <CheckboxGroup options={mockOptions} onChange={handleChange} />
    );

    fireEvent.press(getByTestId('checkbox-1'));
    expect(handleChange).toHaveBeenCalledWith(['1']);

    // Reset the mock
    handleChange.mockClear();

    // Render with a pre-selected option and click to deselect
    const { getByTestId: getByTestId2 } = render(
      <CheckboxGroup options={mockOptions} value={['2']} onChange={handleChange} />
    );

    fireEvent.press(getByTestId2('checkbox-2'));
    expect(handleChange).toHaveBeenCalledWith([]);
  });

  it('renders with a label', () => {
    const { getByText } = render(
      <CheckboxGroup options={mockOptions} label="Select options" />
    );

    expect(getByText('Select options')).toBeTruthy();
  });

  it('renders with a required label', () => {
    const { getByText } = render(
      <CheckboxGroup options={mockOptions} label="Select options" required />
    );

    expect(getByText('Select options')).toBeTruthy();
    expect(getByText('*')).toBeTruthy();
  });

  it('renders with an error message', () => {
    const { getByText } = render(
      <CheckboxGroup options={mockOptions} error="Please select at least one option" />
    );

    expect(getByText('Please select at least one option')).toBeTruthy();
  });

  it('renders with a helper text', () => {
    const { getByText } = render(
      <CheckboxGroup options={mockOptions} helperText="Select all that apply" />
    );

    expect(getByText('Select all that apply')).toBeTruthy();
  });

  it('disables all checkboxes when disabled is true', () => {
    const { getByTestId } = render(
      <CheckboxGroup options={mockOptions} disabled />
    );

    expect(getByTestId('checkbox-1').getAttribute('data-disabled')).toBe('true');
    expect(getByTestId('checkbox-2').getAttribute('data-disabled')).toBe('true');
    expect(getByTestId('checkbox-3').getAttribute('data-disabled')).toBe('true');
  });

  it('renders in a row when row is true', () => {
    const { getByTestId } = render(
      <CheckboxGroup options={mockOptions} row />
    );

    expect(getByTestId('checkbox-1')).toBeTruthy();
  });
}); 