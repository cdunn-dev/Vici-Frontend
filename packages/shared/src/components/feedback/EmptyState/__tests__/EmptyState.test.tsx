import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { EmptyState } from '../EmptyState';
import { Text } from 'react-native';

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
    },
    typography: {
      fontSize: {
        headingMedium: 18,
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

// Mock the Button component
jest.mock('../../../../components/core/Button', () => ({
  Button: ({ title, onPress, testID }) => (
    <button onClick={onPress} data-testid={testID}>
      {title}
    </button>
  ),
}));

describe('EmptyState Component', () => {
  it('renders with title only', () => {
    const { getByTestId, queryByTestId } = render(
      <EmptyState title="No data available" />
    );

    expect(getByTestId('empty-state-title')).toBeTruthy();
    expect(getByTestId('empty-state-title').props.children).toBe('No data available');
    expect(queryByTestId('empty-state-message')).toBeNull();
    expect(queryByTestId('empty-state-action')).toBeNull();
    expect(queryByTestId('empty-state-image')).toBeNull();
  });

  it('renders with title and message', () => {
    const { getByTestId } = render(
      <EmptyState 
        title="No data available" 
        message="There is no data to display at this time."
      />
    );

    expect(getByTestId('empty-state-title').props.children).toBe('No data available');
    expect(getByTestId('empty-state-message').props.children).toBe('There is no data to display at this time.');
  });

  it('renders with a custom icon', () => {
    const { getByTestId } = render(
      <EmptyState 
        title="No data available" 
        icon={<Text testID="custom-icon">🔍</Text>}
      />
    );

    expect(getByTestId('custom-icon')).toBeTruthy();
  });

  it('renders with an image', () => {
    const { getByTestId } = render(
      <EmptyState 
        title="No data available" 
        image={{ uri: 'https://example.com/empty-state.png' }}
      />
    );

    expect(getByTestId('empty-state-image')).toBeTruthy();
  });

  it('renders with action button and calls onAction when pressed', () => {
    const onActionMock = jest.fn();
    const { getByTestId } = render(
      <EmptyState 
        title="No data available" 
        actionLabel="Refresh" 
        onAction={onActionMock}
      />
    );

    const actionButton = getByTestId('empty-state-action');
    expect(actionButton).toBeTruthy();
    
    fireEvent.click(actionButton);
    expect(onActionMock).toHaveBeenCalledTimes(1);
  });

  it('applies custom styles', () => {
    const customStyles = {
      containerStyle: { padding: 32 },
      titleStyle: { fontSize: 24 },
      messageStyle: { fontSize: 16 }
    };
    
    const { getByTestId } = render(
      <EmptyState 
        title="No data available" 
        message="There is no data to display at this time."
        {...customStyles}
      />
    );

    expect(getByTestId('empty-state-title')).toBeTruthy();
    expect(getByTestId('empty-state-message')).toBeTruthy();
  });
}); 