import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { Notification } from '../Notification';

// Mock the theme hook
jest.mock('../../../../hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      primary: '#5224EF',
      secondary: '#4318C9',
      accent: '#E0D8FD',
      success: '#16A34A',
      error: '#DC2626',
      warning: '#F59E0B',
      info: '#3B82F6',
      background: '#FFFFFF',
      backgroundSecondary: '#F9FAFB',
      text: '#11182C',
      textSecondary: '#64748B',
      shadow: '#000000',
    },
    typography: {
      fontSize: {
        bodyLarge: 16,
        bodyMedium: 14,
        bodySmall: 12,
      },
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
    },
    borderRadius: {
      sm: 4,
      md: 8,
      lg: 16,
    },
  }),
}));

// Mock the Animated component
jest.mock('react-native/Libraries/Animated/Animated', () => ({
  View: 'Animated.View',
  timing: jest.fn(() => ({
    start: jest.fn(callback => callback && callback()),
  })),
  Value: jest.fn(() => ({
    interpolate: jest.fn(),
  })),
}));

// Mock the Icon component
jest.mock('../../../../components/core/Icon', () => ({
  Icon: (props: { name: string; size: number; color: string; [key: string]: any }) => {
    const { name, size, color, ...rest } = props;
    return (
      <div 
        data-testid={`icon-${name}`} 
        style={{ width: size, height: size, color }}
        {...rest}
      />
    );
  },
}));

describe('Notification Component', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders with default props', () => {
    const { getByText, getByTestId } = render(
      <Notification message="Test notification" />
    );

    expect(getByText('Test notification')).toBeTruthy();
    expect(getByTestId('icon-info')).toBeTruthy();
  });

  it('renders with title', () => {
    const { getByText } = render(
      <Notification 
        title="Notification Title" 
        message="Test notification" 
      />
    );

    expect(getByText('Notification Title')).toBeTruthy();
    expect(getByText('Test notification')).toBeTruthy();
  });

  it('renders with success type', () => {
    const { getByTestId } = render(
      <Notification 
        type="success" 
        message="Success notification" 
      />
    );

    expect(getByTestId('icon-check-circle')).toBeTruthy();
  });

  it('renders with warning type', () => {
    const { getByTestId } = render(
      <Notification 
        type="warning" 
        message="Warning notification" 
      />
    );

    expect(getByTestId('icon-alert-triangle')).toBeTruthy();
  });

  it('renders with error type', () => {
    const { getByTestId } = render(
      <Notification 
        type="error" 
        message="Error notification" 
      />
    );

    expect(getByTestId('icon-alert-circle')).toBeTruthy();
  });

  it('calls onClose when close button is pressed', () => {
    const onCloseMock = jest.fn();
    const { getByTestId } = render(
      <Notification 
        message="Test notification" 
        onClose={onCloseMock}
      />
    );

    fireEvent.press(getByTestId('close-button'));
    expect(onCloseMock).toHaveBeenCalled();
  });

  it('auto closes after duration', () => {
    const onCloseMock = jest.fn();
    render(
      <Notification 
        message="Test notification" 
        duration={1000}
        onClose={onCloseMock}
        autoClose={true}
      />
    );

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(onCloseMock).toHaveBeenCalled();
  });

  it('does not auto close when autoClose is false', () => {
    const onCloseMock = jest.fn();
    render(
      <Notification 
        message="Test notification" 
        duration={1000}
        onClose={onCloseMock}
        autoClose={false}
      />
    );

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(onCloseMock).not.toHaveBeenCalled();
  });
}); 