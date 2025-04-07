import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ErrorBoundary } from '../ErrorBoundary';
import { ThemeProvider } from '../../contexts/ThemeContext';

const ThrowError = () => {
  throw new Error('Test error');
};

const renderWithTheme = (component: React.ReactNode) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders children when there is no error', () => {
    const { getByText } = renderWithTheme(
      <ErrorBoundary>
        <text>Test content</text>
      </ErrorBoundary>
    );
    expect(getByText('Test content')).toBeTruthy();
  });

  it('renders error UI when there is an error', () => {
    const { getByText } = renderWithTheme(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    expect(getByText('Something went wrong')).toBeTruthy();
    expect(getByText('Test error')).toBeTruthy();
  });

  it('resets error state when try again button is pressed', () => {
    const { getByText, queryByText } = renderWithTheme(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    
    const tryAgainButton = getByText('Try Again');
    fireEvent.press(tryAgainButton);
    
    expect(queryByText('Something went wrong')).toBeNull();
  });
}); 