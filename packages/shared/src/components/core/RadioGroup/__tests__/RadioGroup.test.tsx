import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { RadioGroup } from '../RadioGroup';

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

describe('RadioGroup Component', () => {
  const options = [
    { label: 'Option 1', value: '1' },
    { label: 'Option 2', value: '2' },
    { label: 'Option 3', value: '3' },
  ];

  it('renders with default props', () => {
    const { getByTestId, getAllByRole } = render(
      <RadioGroup options={options} />
    );
    
    expect(getByTestId('radio-group')).toBeTruthy();
    expect(getByTestId('radio-group-options')).toBeTruthy();
    expect(getAllByRole('radio')).toHaveLength(3);
  });

  it('renders with a label', () => {
    const { getByText, getByTestId } = render(
      <RadioGroup options={options} label="Select an option" />
    );
    
    expect(getByTestId('radio-group-label')).toBeTruthy();
    expect(getByText('Select an option')).toBeTruthy();
  });

  it('renders with required indicator', () => {
    const { getByText } = render(
      <RadioGroup options={options} label="Select an option" required />
    );
    
    expect(getByText('*')).toBeTruthy();
  });

  it('renders with a selected value', () => {
    const { getByTestId } = render(
      <RadioGroup options={options} value="2" />
    );
    
    expect(getByTestId('radio-group-radio-inner-2')).toBeTruthy();
  });

  it('renders with error message', () => {
    const { getByText, getByTestId } = render(
      <RadioGroup options={options} error="Please select an option" />
    );
    
    expect(getByTestId('radio-group-error')).toBeTruthy();
    expect(getByText('Please select an option')).toBeTruthy();
  });

  it('renders with helper text', () => {
    const { getByText, getByTestId } = render(
      <RadioGroup options={options} helperText="Choose your preferred option" />
    );
    
    expect(getByTestId('radio-group-helper-text')).toBeTruthy();
    expect(getByText('Choose your preferred option')).toBeTruthy();
  });

  it('renders in horizontal orientation', () => {
    const { getByTestId } = render(
      <RadioGroup options={options} orientation="horizontal" />
    );
    
    const optionsContainer = getByTestId('radio-group-options');
    expect(optionsContainer.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          flexDirection: 'row',
        }),
      ])
    );
  });
  
  it('renders with different sizes', () => {
    const { getByTestId, rerender } = render(
      <RadioGroup options={options} size="small" />
    );
    
    // Test small size
    let radioButton = getByTestId('radio-group-radio-1');
    expect(radioButton.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          width: 16,
          height: 16,
        }),
      ])
    );
    
    // Test large size
    rerender(<RadioGroup options={options} size="large" />);
    
    radioButton = getByTestId('radio-group-radio-1');
    expect(radioButton.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          width: 24,
          height: 24,
        }),
      ])
    );
  });

  it('calls onChange when option is selected', () => {
    const onChangeMock = jest.fn();
    const { getByTestId } = render(
      <RadioGroup options={options} onChange={onChangeMock} />
    );
    
    fireEvent.press(getByTestId('radio-group-option-2'));
    
    expect(onChangeMock).toHaveBeenCalledWith('2');
  });

  it('renders disabled radio group', () => {
    const onChangeMock = jest.fn();
    const { getByTestId } = render(
      <RadioGroup options={options} onChange={onChangeMock} disabled />
    );
    
    fireEvent.press(getByTestId('radio-group-option-2'));
    
    expect(onChangeMock).not.toHaveBeenCalled();
  });

  it('renders with a disabled option', () => {
    const onChangeMock = jest.fn();
    const optionsWithDisabled = [
      { label: 'Option 1', value: '1' },
      { label: 'Option 2', value: '2', disabled: true },
      { label: 'Option 3', value: '3' },
    ];
    
    const { getByTestId } = render(
      <RadioGroup options={optionsWithDisabled} onChange={onChangeMock} />
    );
    
    fireEvent.press(getByTestId('radio-group-option-2'));
    
    expect(onChangeMock).not.toHaveBeenCalled();
  });

  it('applies custom styles', () => {
    const customStyle = { marginTop: 20 };
    const { getByTestId } = render(
      <RadioGroup options={options} style={customStyle} />
    );
    
    const container = getByTestId('radio-group');
    expect(container.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining(customStyle)
      ])
    );
  });
}); 