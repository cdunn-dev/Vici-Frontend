import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Input } from '../Input';

describe('Input', () => {
  it('renders correctly with default props', () => {
    const { getByTestId } = render(<Input placeholder="Enter text" />);
    expect(getByTestId('input-container')).toBeTruthy();
    expect(getByTestId('text-input')).toBeTruthy();
  });

  it('displays label when provided', () => {
    const { getByTestId, getByText } = render(
      <Input label="Username" placeholder="Enter username" />
    );
    expect(getByTestId('input-label')).toBeTruthy();
    expect(getByText('Username')).toBeTruthy();
  });

  it('displays error message when provided', () => {
    const { getByTestId, getByText } = render(
      <Input error="Invalid input" placeholder="Enter text" />
    );
    expect(getByTestId('input-error')).toBeTruthy();
    expect(getByText('Invalid input')).toBeTruthy();
  });

  it('displays helper text when provided and no error', () => {
    const { getByTestId, getByText } = render(
      <Input helperText="Helper text" placeholder="Enter text" />
    );
    expect(getByTestId('input-helper')).toBeTruthy();
    expect(getByText('Helper text')).toBeTruthy();
  });

  it('prioritizes error over helper text', () => {
    const { queryByTestId, getByText } = render(
      <Input
        error="Error message"
        helperText="Helper text"
        placeholder="Enter text"
      />
    );
    expect(getByText('Error message')).toBeTruthy();
    expect(queryByTestId('input-helper')).toBeNull();
  });

  it('handles text input correctly', () => {
    const onChangeText = jest.fn();
    const { getByTestId } = render(
      <Input placeholder="Enter text" onChangeText={onChangeText} />
    );
    
    const input = getByTestId('text-input');
    fireEvent.changeText(input, 'test input');
    
    expect(onChangeText).toHaveBeenCalledWith('test input');
  });

  it('disables input when loading or disabled', () => {
    const { getByTestId, rerender } = render(
      <Input placeholder="Enter text" loading />
    );
    
    expect(getByTestId('text-input').props.editable).toBe(false);
    
    rerender(<Input placeholder="Enter text" disabled />);
    expect(getByTestId('text-input').props.editable).toBe(false);
  });
}); 