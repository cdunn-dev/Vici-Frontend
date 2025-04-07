import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import { ThemeProvider, useTheme } from '../ThemeContext';

describe('ThemeContext', () => {
  it('provides default theme values', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    );

    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.colors.primary).toBe('#007AFF');
    expect(result.current.colors.background).toBe('#fff');
    expect(result.current.spacing.md).toBe(16);
    expect(result.current.borderRadius.md).toBe(8);
  });

  it('allows theme override', () => {
    const customTheme = {
      colors: {
        primary: '#FF0000',
        secondary: '#00FF00',
        background: '#000000',
        text: '#FFFFFF',
        error: '#FF0000',
        border: '#333333',
      },
      spacing: {
        xs: 2,
        sm: 4,
        md: 8,
        lg: 16,
        xl: 24,
      },
      borderRadius: {
        sm: 2,
        md: 4,
        lg: 8,
      },
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider theme={customTheme}>{children}</ThemeProvider>
    );

    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.colors.primary).toBe('#FF0000');
    expect(result.current.colors.background).toBe('#000000');
    expect(result.current.spacing.md).toBe(8);
    expect(result.current.borderRadius.md).toBe(4);
  });

  it('throws error when used outside of ThemeProvider', () => {
    const { result } = renderHook(() => useTheme());

    expect(result.error).toEqual(
      Error('useTheme must be used within a ThemeProvider')
    );
  });
}); 