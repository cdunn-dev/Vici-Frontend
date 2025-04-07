import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '../../contexts/ThemeContext';
import Button from '../Button';

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

describe('Button', () => {
  it('renders correctly with default props', () => {
    const { getByText } = render(<Button>Press me</Button>);
    expect(getByText('Press me')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button onPress={onPress}>Press me</Button>);
    fireEvent.press(getByText('Press me'));
    expect(onPress).toHaveBeenCalled();
  });

  it('renders correctly with secondary variant', () => {
    const { getByText } = render(<Button variant="secondary">Press me</Button>);
    const buttonText = getByText('Press me');
    expect(buttonText.props.style).toContainEqual(expect.objectContaining({ color: '#007AFF' }));
  });

  it('shows loading indicator when loading prop is true', () => {
    const { getByTestId, queryByText } = render(<Button loading>Press me</Button>);
    expect(getByTestId('loading-indicator')).toBeTruthy();
    expect(queryByText('Press me')).toBeNull();
  });

  it('is disabled when disabled prop is true', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button disabled onPress={onPress}>
        Press me
      </Button>
    );
    const button = getByText('Press me').parent;
    expect(button.props.disabled).toBe(true);
  });

  it('renders with title', () => {
    const { getByText } = render(
      <TestWrapper>
        <Button title="Test Button" onPress={() => {}} />
      </TestWrapper>
    );
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('shows loading state', () => {
    const { getByTestId } = render(
      <TestWrapper>
        <Button title="Test Button" onPress={() => {}} loading={true} />
      </TestWrapper>
    );
    
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('applies disabled state correctly', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <TestWrapper>
        <Button title="Test Button" onPress={onPressMock} disabled={true} />
      </TestWrapper>
    );
    
    fireEvent.press(getByText('Test Button'));
    expect(onPressMock).not.toHaveBeenCalled();
  });

  it('renders different variants correctly', () => {
    const { getByText, rerender } = render(
      <TestWrapper>
        <Button title="Primary Button" onPress={() => {}} variant="primary" />
      </TestWrapper>
    );
    
    expect(getByText('Primary Button')).toBeTruthy();
    
    rerender(
      <TestWrapper>
        <Button title="Outline Button" onPress={() => {}} variant="outline" />
      </TestWrapper>
    );
    
    expect(getByText('Outline Button')).toBeTruthy();
  });
}); 