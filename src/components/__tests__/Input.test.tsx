import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '../../contexts/ThemeContext';
import Input from '../Input';

describe('Input Component', () => {
  const mockOnChange = jest.fn();

  const renderInput = (props = {}) => {
    return render(
      <ThemeProvider>
        <Input
          placeholder="Enter text"
          value=""
          onChangeText={mockOnChange}
          {...props}
        />
      </ThemeProvider>
    );
  };

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders correctly with placeholder', () => {
    const { getByPlaceholderText } = renderInput();
    expect(getByPlaceholderText('Enter text')).toBeTruthy();
  });

  it('calls onChangeText when text is entered', () => {
    const { getByPlaceholderText } = renderInput();
    const input = getByPlaceholderText('Enter text');
    
    fireEvent.changeText(input, 'test input');
    expect(mockOnChange).toHaveBeenCalledWith('test input');
  });

  it('displays error message when error prop is provided', () => {
    const { getByText } = renderInput({ error: 'Invalid input' });
    expect(getByText('Invalid input')).toBeTruthy();
  });

  it('applies disabled styles when disabled prop is true', () => {
    const { getByPlaceholderText } = renderInput({ disabled: true });
    const input = getByPlaceholderText('Enter text');
    expect(input.props.editable).toBe(false);
  });
}); 