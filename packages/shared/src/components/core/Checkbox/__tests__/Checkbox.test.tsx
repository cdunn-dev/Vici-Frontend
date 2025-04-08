import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Checkbox } from '../Checkbox';

// Mock the useTheme hook
jest.mock('../../../../hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      primary: '#5224EF',
      text: '#11182C',
      background: '#FFFFFF',
    },
    typography: {
      fontSize: {
        bodyMedium: 14,
      },
    },
  }),
}));

describe('Checkbox', () => {
  const onPress = jest.fn();

  beforeEach(() => {
    onPress.mockClear();
  });

  it('renders correctly with default props', () => {
    const { getByTestId } = render(
      <Checkbox checked={false} onPress={onPress} />
    );
    const checkbox = getByTestId('checkbox');
    expect(checkbox).toBeTruthy();
  });

  it('renders with label', () => {
    const { getByText } = render(
      <Checkbox checked={false} onPress={onPress} label="Test Checkbox" />
    );
    const label = getByText('Test Checkbox');
    expect(label).toBeTruthy();
  });

  it('renders checked state', () => {
    const { getByTestId } = render(
      <Checkbox checked={true} onPress={onPress} />
    );
    const checkbox = getByTestId('checkbox');
    expect(checkbox).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const { getByTestId } = render(
      <Checkbox checked={false} onPress={onPress} />
    );
    const checkbox = getByTestId('checkbox');
    fireEvent.press(checkbox);
    expect(onPress).toHaveBeenCalled();
  });

  it('does not call onPress when disabled', () => {
    const { getByTestId } = render(
      <Checkbox checked={false} onPress={onPress} disabled={true} />
    );
    const checkbox = getByTestId('checkbox');
    fireEvent.press(checkbox);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('renders with different sizes', () => {
    const { getByTestId } = render(
      <Checkbox checked={false} onPress={onPress} size="small" />
    );
    const checkbox = getByTestId('checkbox');
    expect(checkbox).toBeTruthy();
  });

  it('applies custom styles', () => {
    const customStyle = { margin: 10 };
    const { getByTestId } = render(
      <Checkbox checked={false} onPress={onPress} style={customStyle} />
    );
    const checkbox = getByTestId('checkbox');
    expect(checkbox.props.style).toEqual(
      expect.objectContaining(customStyle)
    );
  });

  it('applies custom label styles', () => {
    const customLabelStyle = { color: '#FF0000' };
    const { getByText } = render(
      <Checkbox
        checked={false}
        onPress={onPress}
        label="Test Checkbox"
        labelStyle={customLabelStyle}
      />
    );
    const label = getByText('Test Checkbox');
    expect(label.props.style).toEqual(
      expect.objectContaining(customLabelStyle)
    );
  });
}); 