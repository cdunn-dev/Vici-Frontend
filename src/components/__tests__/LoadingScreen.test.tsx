import React from 'react';
import { render } from '@testing-library/react-native';
import { LoadingScreen } from '../LoadingScreen';
import { ThemeProvider } from '../../contexts/ThemeContext';

describe('LoadingScreen', () => {
  it('renders correctly', () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <LoadingScreen />
      </ThemeProvider>
    );
    
    expect(getByTestId('loading-container')).toBeTruthy();
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('uses theme colors', () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <LoadingScreen />
      </ThemeProvider>
    );
    
    const container = getByTestId('loading-container');
    expect(container.props.style.backgroundColor).toBe('#FFFFFF');
  });
}); 