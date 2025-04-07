import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { logger } from '../utils/logger';

// Mock the logger
jest.mock('../utils/logger', () => ({
  logger: {
    error: jest.fn(),
  },
}));

describe('ErrorBoundary', () => {
  const ErrorComponent = () => {
    throw new Error('Test error');
  };

  const NormalComponent = () => <Text>Normal content</Text>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render children when there is no error', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <NormalComponent />
      </ErrorBoundary>
    );

    expect(getByText('Normal content')).toBeTruthy();
  });

  it('should render fallback UI when there is an error', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );

    expect(getByText('Something went wrong')).toBeTruthy();
    expect(getByText('Test error')).toBeTruthy();
    expect(getByText('Try Again')).toBeTruthy();
  });

  it('should log error when caught', () => {
    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );

    expect(logger.error).toHaveBeenCalledWith(
      'Error Boundary Caught Error',
      expect.any(Error),
      expect.any(Object)
    );
  });

  it('should recover from error when retry is pressed', () => {
    const { getByText, rerender } = render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );

    fireEvent.press(getByText('Try Again'));

    rerender(
      <ErrorBoundary>
        <NormalComponent />
      </ErrorBoundary>
    );

    expect(getByText('Normal content')).toBeTruthy();
  });

  it('should render custom fallback when provided', () => {
    const CustomFallback = () => <Text>Custom fallback</Text>;

    const { getByText } = render(
      <ErrorBoundary fallback={<CustomFallback />}>
        <ErrorComponent />
      </ErrorBoundary>
    );

    expect(getByText('Custom fallback')).toBeTruthy();
  });
}); 