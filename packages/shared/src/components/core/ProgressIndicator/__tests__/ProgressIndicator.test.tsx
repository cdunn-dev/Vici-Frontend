import React from 'react';
import { render } from '@testing-library/react-native';
import { ProgressIndicator } from '../ProgressIndicator';
import { useTheme } from '../../../../hooks/useTheme';

// Mock the useTheme hook
jest.mock('../../../../hooks/useTheme', () => ({
  useTheme: jest.fn(),
}));

describe('ProgressIndicator', () => {
  const mockTheme = {
    colors: {
      primary: '#007AFF',
      secondary: '#5856D6',
      accent: '#FF9500',
      success: '#34C759',
      error: '#FF3B30',
      warning: '#FFCC00',
      background: '#FFFFFF',
      backgroundSecondary: '#F2F2F7',
      text: '#000000',
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
    },
    typography: {
      fontSize: {
        bodySmall: 12,
        bodyMedium: 14,
        bodyLarge: 16,
      },
    },
    borderRadius: {
      sm: 4,
      md: 8,
      lg: 12,
      full: 9999,
    },
  };

  beforeEach(() => {
    (useTheme as jest.Mock).mockReturnValue(mockTheme);
  });

  it('renders linear progress indicator correctly', () => {
    const { getByTestId } = render(
      <ProgressIndicator
        type="linear"
        value={50}
        testID="progress-indicator"
      />
    );

    const indicator = getByTestId('progress-indicator');
    expect(indicator).toBeTruthy();
  });

  it('renders circular progress indicator correctly', () => {
    const { getByTestId } = render(
      <ProgressIndicator
        type="circular"
        value={75}
        testID="progress-indicator"
      />
    );

    const indicator = getByTestId('progress-indicator');
    expect(indicator).toBeTruthy();
  });

  it('renders steps progress indicator correctly', () => {
    const { getByTestId } = render(
      <ProgressIndicator
        type="steps"
        value={3}
        maxValue={5}
        testID="progress-indicator"
      />
    );

    const indicator = getByTestId('progress-indicator');
    expect(indicator).toBeTruthy();
  });

  it('shows correct percentage value', () => {
    const { getByText } = render(
      <ProgressIndicator
        value={75}
        showValue
      />
    );

    expect(getByText('75%')).toBeTruthy();
  });

  it('shows label when provided', () => {
    const { getByText } = render(
      <ProgressIndicator
        value={50}
        label="Progress"
      />
    );

    expect(getByText('Progress')).toBeTruthy();
  });

  it('applies custom color when provided', () => {
    const customColor = '#FF0000';
    const { getByTestId } = render(
      <ProgressIndicator
        value={50}
        color={customColor}
        testID="progress-indicator"
      />
    );

    const indicator = getByTestId('progress-indicator');
    expect(indicator.props.style.backgroundColor).toBe(customColor);
  });

  it('applies custom size styles', () => {
    const { getByTestId } = render(
      <ProgressIndicator
        value={50}
        size="large"
        testID="progress-indicator"
      />
    );

    const indicator = getByTestId('progress-indicator');
    expect(indicator.props.style.height).toBe(12);
  });

  it('clamps value between 0 and maxValue', () => {
    const { getByText } = render(
      <ProgressIndicator
        value={150}
        maxValue={100}
        showValue
      />
    );

    expect(getByText('100%')).toBeTruthy();
  });

  it('applies custom styles', () => {
    const customStyle = { marginTop: 20 };
    const { getByTestId } = render(
      <ProgressIndicator
        value={50}
        style={customStyle}
        testID="progress-indicator"
      />
    );

    const indicator = getByTestId('progress-indicator');
    expect(indicator.props.style).toContainEqual(customStyle);
  });
}); 