import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Alert } from '../Alert';
import { useTheme } from "@/theme/useTheme";

// Mock the useTheme hook
jest.mock('../../../../hooks/useTheme', () => ({
  useTheme: jest.fn(),
}));

describe('Alert', () => {
  const mockTheme = {
    colors: {
      primary: '#007AFF',
      secondary: '#5856D6',
      accent: '#FF9500',
      success: '#34C759',
      error: '#FF3B30',
      warning: '#FFCC00',
      background: '#FFFFFF',
      text: '#000000',
      white: '#FFFFFF',
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
    },
  };

  beforeEach(() => {
    (useTheme as jest.Mock).mockReturnValue(mockTheme);
  });

  it('renders correctly with default props', () => {
    const { getByText } = render(
      <Alert message="This is an alert message" />
    );

    expect(getByText('This is an alert message')).toBeTruthy();
  });

  it('renders with title', () => {
    const { getByText } = render(
      <Alert
        title="Alert Title"
        message="This is an alert message"
      />
    );

    expect(getByText('Alert Title')).toBeTruthy();
    expect(getByText('This is an alert message')).toBeTruthy();
  });

  it('renders different types correctly', () => {
    const { rerender, getByTestId } = render(
      <Alert
        type="success"
        message="Success message"
        testID="alert"
      />
    );

    let alert = getByTestId('alert');
    expect(alert.props.style.backgroundColor).toBe('#34C75910');

    rerender(
      <Alert
        type="warning"
        message="Warning message"
        testID="alert"
      />
    );

    alert = getByTestId('alert');
    expect(alert.props.style.backgroundColor).toBe('#FFCC0010');

    rerender(
      <Alert
        type="error"
        message="Error message"
        testID="alert"
      />
    );

    alert = getByTestId('alert');
    expect(alert.props.style.backgroundColor).toBe('#FF3B3010');
  });

  it('handles close button press', () => {
    const onClose = jest.fn();
    const { getByTestId } = render(
      <Alert
        message="This is an alert message"
        showClose
        onClose={onClose}
        testID="close-button"
      />
    );

    fireEvent.press(getByTestId('close-button'));
    expect(onClose).toHaveBeenCalled();
  });

  it('handles action button press', () => {
    const onActionPress = jest.fn();
    const { getByText } = render(
      <Alert
        message="This is an alert message"
        actions={[
          {
            label: 'Action',
            onPress: onActionPress,
            type: 'primary',
          },
        ]}
      />
    );

    fireEvent.press(getByText('Action'));
    expect(onActionPress).toHaveBeenCalled();
  });

  it('hides icon when showIcon is false', () => {
    const { queryByTestId } = render(
      <Alert
        message="This is an alert message"
        showIcon={false}
        testID="alert-icon"
      />
    );

    expect(queryByTestId('alert-icon')).toBeNull();
  });

  it('uses custom icon when provided', () => {
    const { getByTestId } = render(
      <Alert
        message="This is an alert message"
        icon="custom-icon"
        testID="alert-icon"
      />
    );

    const icon = getByTestId('alert-icon');
    expect(icon.props.name).toBe('custom-icon');
  });

  it('applies custom styles', () => {
    const customStyle = { marginTop: 20 };
    const { getByTestId } = render(
      <Alert
        message="This is an alert message"
        style={customStyle}
        testID="alert"
      />
    );

    const alert = getByTestId('alert');
    expect(alert.props.style).toContainEqual(customStyle);
  });
}); 