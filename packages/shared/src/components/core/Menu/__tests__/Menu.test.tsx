import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Menu } from '../Menu';
import { useTheme } from '../../../../hooks/useTheme';

// Mock the useTheme hook
jest.mock('../../../../hooks/useTheme', () => ({
  useTheme: jest.fn(),
}));

describe('Menu', () => {
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
      textSecondary: '#8E8E93',
      border: '#C7C7CC',
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

  const mockItems = [
    {
      id: '1',
      label: 'Profile',
      icon: 'user',
      type: 'primary' as const,
    },
    {
      id: '2',
      label: 'Settings',
      icon: 'settings',
      subItems: [
        {
          id: '2.1',
          label: 'Account',
          icon: 'user',
        },
        {
          id: '2.2',
          label: 'Notifications',
          icon: 'bell',
        },
      ],
    },
    {
      id: '3',
      label: 'Logout',
      icon: 'log-out',
      type: 'danger' as const,
      disabled: true,
    },
  ];

  it('renders correctly with default props', () => {
    const { getByText } = render(<Menu items={mockItems} />);
    
    expect(getByText('Profile')).toBeTruthy();
    expect(getByText('Settings')).toBeTruthy();
    expect(getByText('Logout')).toBeTruthy();
  });

  it('handles item press events', () => {
    const onItemPress = jest.fn();
    const { getByText } = render(
      <Menu items={mockItems} onItemPress={onItemPress} />
    );

    fireEvent.press(getByText('Profile'));
    expect(onItemPress).toHaveBeenCalledWith(mockItems[0]);
  });

  it('toggles sub-items visibility', () => {
    const { getByText, queryByText } = render(
      <Menu items={mockItems} />
    );

    // Initially, sub-items should not be visible
    expect(queryByText('Account')).toBeNull();
    expect(queryByText('Notifications')).toBeNull();

    // Click the Settings item to expand
    fireEvent.press(getByText('Settings'));
    expect(getByText('Account')).toBeTruthy();
    expect(getByText('Notifications')).toBeTruthy();

    // Click again to collapse
    fireEvent.press(getByText('Settings'));
    expect(queryByText('Account')).toBeNull();
    expect(queryByText('Notifications')).toBeNull();
  });

  it('respects disabled items', () => {
    const onItemPress = jest.fn();
    const { getByText } = render(
      <Menu items={mockItems} onItemPress={onItemPress} />
    );

    fireEvent.press(getByText('Logout'));
    expect(onItemPress).not.toHaveBeenCalled();
  });

  it('applies custom styles', () => {
    const customStyle = { backgroundColor: '#F5F5F5' };
    const { getByTestId } = render(
      <Menu items={mockItems} style={customStyle} />
    );

    const container = getByTestId('menu-container');
    expect(container.props.style).toContainEqual(customStyle);
  });

  it('hides icons when showIcons is false', () => {
    const { getByText } = render(
      <Menu items={mockItems} showIcons={false} />
    );

    const profileItem = getByText('Profile');
    expect(profileItem.props.children).not.toContain('user');
  });

  it('hides dividers when showDividers is false', () => {
    const { getByTestId } = render(
      <Menu items={mockItems} showDividers={false} />
    );

    const container = getByTestId('menu-container');
    expect(container.props.children).not.toContain('divider');
  });
}); 