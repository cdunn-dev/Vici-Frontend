import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '../contexts/ThemeContext';
import Button from './Button';

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

describe('Button', () => {
  it('renders with title', () => {
    const { getByText } = render(
      <TestWrapper>
        <Button title="Test Button" onPress={() => {}} />
      </TestWrapper>
    );
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <TestWrapper>
        <Button title="Test Button" onPress={onPress} />
      </TestWrapper>
    );
    fireEvent.press(getByText('Test Button'));
    expect(onPress).toHaveBeenCalled();
  });
}); 