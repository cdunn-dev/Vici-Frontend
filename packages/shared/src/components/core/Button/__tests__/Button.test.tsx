import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../Button';

describe('Button', () => {
  it('renders correctly with default props', () => {
    const { getByText } = render(<Button title="Test Button" onPress={() => {}} />);
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button title="Test Button" onPress={onPress} />);
    
    fireEvent.press(getByText('Test Button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('shows loading indicator when loading prop is true', () => {
    const { getByTestId, queryByText } = render(
      <Button title="Test Button" onPress={() => {}} loading />
    );
    
    expect(getByTestId('loading-indicator')).toBeTruthy();
    expect(queryByText('Test Button')).toBeNull();
  });

  it('is disabled when disabled prop is true', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button title="Test Button" onPress={onPress} disabled />
    );
    
    fireEvent.press(getByText('Test Button'));
    expect(onPress).not.toHaveBeenCalled();
  });
}); 