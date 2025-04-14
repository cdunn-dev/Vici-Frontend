import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { Toast } from '../Toast';

// Mock the useTheme hook
jest.mock('../../../hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      background: '#FFFFFF',
      text: '#000000',
      primary: '#5224EF',
      success: '#16A34A',
      error: '#DC2626',
      warning: '#F59E0B',
    },
  }),
}));

// Mock setTimeout
jest.useFakeTimers();

describe('Toast', () => {
  const onDismiss = jest.fn();

  beforeEach(() => {
    onDismiss.mockClear();
    jest.clearAllTimers();
  });

  it('renders correctly with default props', () => {
    const { getByTestId, getByText } = render(
      <Toast
        visible={true}
        message="Test Toast"
        onDismiss={onDismiss}
        testID="toast"
      />
    );

    expect(getByTestId('toast')).toBeTruthy();
    expect(getByText('Test Toast')).toBeTruthy();
  });

  it('renders with different types', () => {
    const types = ['success', 'error', 'info', 'warning'] as const;

    types.forEach((type) => {
      const { getByTestId } = render(
        <Toast
          visible={true}
          message="Test Toast"
          type={type}
          onDismiss={onDismiss}
          testID={`toast-${type}`}
        />
      );

      expect(getByTestId(`toast-${type}`)).toBeTruthy();
    });
  });

  it('calls onDismiss when clicked', () => {
    const { getByTestId } = render(
      <Toast
        visible={true}
        message="Test Toast"
        onDismiss={onDismiss}
        testID="toast"
      />
    );

    fireEvent.press(getByTestId('toast'));
    expect(onDismiss).toHaveBeenCalled();
  });

  it('auto-dismisses after duration', () => {
    const duration = 3000;
    render(
      <Toast
        visible={true}
        message="Test Toast"
        onDismiss={onDismiss}
        duration={duration}
      />
    );

    act(() => {
      jest.advanceTimersByTime(duration);
    });

    expect(onDismiss).toHaveBeenCalled();
  });

  it('applies custom styles', () => {
    const customStyle = { backgroundColor: 'red' };
    const { getByTestId } = render(
      <Toast
        visible={true}
        message="Test Toast"
        onDismiss={onDismiss}
        style={customStyle}
        testID="toast"
      />
    );

    const toast = getByTestId('toast');
    expect(toast.props.style).toContain(customStyle);
  });

  it('does not render when visible is false', () => {
    const { queryByTestId } = render(
      <Toast
        visible={false}
        message="Test Toast"
        onDismiss={onDismiss}
        testID="toast"
      />
    );

    expect(queryByTestId('toast')).toBeNull();
  });

  it('cleans up timer on unmount', () => {
    const { unmount } = render(
      <Toast
        visible={true}
        message="Test Toast"
        onDismiss={onDismiss}
        duration={3000}
      />
    );

    unmount();
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(onDismiss).not.toHaveBeenCalled();
  });
}); 