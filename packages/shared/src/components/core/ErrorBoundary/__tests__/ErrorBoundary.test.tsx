import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { ErrorBoundary } from '../ErrorBoundary';

// Mock console.error to avoid test output noise
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

// Mock the theme hook
jest.mock('../../../../hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      primary: '#5224EF',
      secondary: '#4318C9',
      error: '#DC2626',
      background: '#FFFFFF',
      text: '#11182C',
    },
  }),
}));

// Component that throws an error
const ErrorThrowingComponent = ({ shouldThrow = true }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <Text>No error</Text>;
};

describe('ErrorBoundary Component', () => {
  it('renders children when there is no error', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <Text>Normal content</Text>
      </ErrorBoundary>
    );
    
    expect(getByText('Normal content')).toBeTruthy();
  });
  
  it('renders the default fallback UI when an error occurs', () => {
    // Suppress React's error boundary warning in test
    const spy = jest.spyOn(console, 'error');
    spy.mockImplementation(() => {});
    
    const { getByTestId, getByText } = render(
      <ErrorBoundary>
        <ErrorThrowingComponent />
      </ErrorBoundary>
    );
    
    expect(getByTestId('error-fallback')).toBeTruthy();
    expect(getByText('Something went wrong')).toBeTruthy();
    expect(getByText('Test error')).toBeTruthy();
    
    spy.mockRestore();
  });
  
  it('calls onError when an error occurs', () => {
    const onError = jest.fn();
    
    // Suppress React's error boundary warning in test
    const spy = jest.spyOn(console, 'error');
    spy.mockImplementation(() => {});
    
    render(
      <ErrorBoundary onError={onError}>
        <ErrorThrowingComponent />
      </ErrorBoundary>
    );
    
    expect(onError).toHaveBeenCalled();
    expect(onError.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(onError.mock.calls[0][0].message).toBe('Test error');
    
    spy.mockRestore();
  });
  
  it('renders a custom fallback component when provided', () => {
    // Suppress React's error boundary warning in test
    const spy = jest.spyOn(console, 'error');
    spy.mockImplementation(() => {});
    
    const customFallback = <Text testID="custom-fallback">Custom Error UI</Text>;
    
    const { getByTestId, queryByTestId } = render(
      <ErrorBoundary fallback={customFallback}>
        <ErrorThrowingComponent />
      </ErrorBoundary>
    );
    
    expect(getByTestId('custom-fallback')).toBeTruthy();
    expect(queryByTestId('error-fallback')).toBeNull();
    
    spy.mockRestore();
  });
  
  it('renders a functional fallback when provided', () => {
    // Suppress React's error boundary warning in test
    const spy = jest.spyOn(console, 'error');
    spy.mockImplementation(() => {});
    
    const functionalFallback = (error: Error, resetError: () => void) => (
      <Text testID="functional-fallback">{error.message}</Text>
    );
    
    const { getByTestId, getByText } = render(
      <ErrorBoundary fallback={functionalFallback}>
        <ErrorThrowingComponent />
      </ErrorBoundary>
    );
    
    expect(getByTestId('functional-fallback')).toBeTruthy();
    expect(getByText('Test error')).toBeTruthy();
    
    spy.mockRestore();
  });
  
  it('resets the error state when reset button is clicked', () => {
    // Suppress React's error boundary warning in test
    const spy = jest.spyOn(console, 'error');
    spy.mockImplementation(() => {});
    
    const { getByTestId, getByText, queryByTestId, rerender } = render(
      <ErrorBoundary>
        <ErrorThrowingComponent />
      </ErrorBoundary>
    );
    
    expect(getByTestId('error-fallback')).toBeTruthy();
    
    // Fix the component so it doesn't throw anymore
    rerender(
      <ErrorBoundary>
        <ErrorThrowingComponent shouldThrow={false} />
      </ErrorBoundary>
    );
    
    // Click the reset button
    fireEvent.press(getByTestId('error-fallback-reset-button'));
    
    // Now we should see the normal content
    expect(queryByTestId('error-fallback')).toBeNull();
    expect(getByText('No error')).toBeTruthy();
    
    spy.mockRestore();
  });
  
  it('uses a custom testID when provided', () => {
    // Suppress React's error boundary warning in test
    const spy = jest.spyOn(console, 'error');
    spy.mockImplementation(() => {});
    
    const { getByTestId } = render(
      <ErrorBoundary testID="custom-error-boundary">
        <ErrorThrowingComponent />
      </ErrorBoundary>
    );
    
    expect(getByTestId('custom-error-boundary')).toBeTruthy();
    
    spy.mockRestore();
  });
}); 