import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Timeline } from '../Timeline';
import { useTheme } from '../../../../hooks/useTheme';

// Mock the useTheme hook
jest.mock('../../../../hooks/useTheme', () => ({
  useTheme: jest.fn(),
}));

describe('Timeline', () => {
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
  };

  beforeEach(() => {
    (useTheme as jest.Mock).mockReturnValue(mockTheme);
  });

  const mockItems = [
    {
      id: '1',
      date: new Date('2024-03-20'),
      type: 'workout' as const,
      title: 'Morning Run',
      description: 'Easy recovery run',
      distance: 5,
      duration: 45,
      intensity: 'easy' as const,
      completed: true,
    },
    {
      id: '2',
      date: new Date('2024-03-21'),
      type: 'race' as const,
      title: 'Marathon',
      description: 'Main race event',
      distance: 26.2,
      duration: 240,
      intensity: 'hard' as const,
      completed: false,
      isRace: true,
    },
    {
      id: '3',
      date: new Date('2024-03-22'),
      type: 'rest' as const,
      title: 'Rest Day',
      description: 'Active recovery',
      completed: false,
    },
  ];

  it('renders correctly with default props', () => {
    const { getByText } = render(<Timeline items={mockItems} />);
    
    expect(getByText('Morning Run')).toBeTruthy();
    expect(getByText('Marathon')).toBeTruthy();
    expect(getByText('Rest Day')).toBeTruthy();
  });

  it('groups items by day correctly', () => {
    const { getByText } = render(<Timeline items={mockItems} groupBy="day" />);
    
    expect(getByText('Mar 20')).toBeTruthy();
    expect(getByText('Mar 21')).toBeTruthy();
    expect(getByText('Mar 22')).toBeTruthy();
  });

  it('handles item press events', () => {
    const onItemPress = jest.fn();
    const { getByText } = render(
      <Timeline items={mockItems} onItemPress={onItemPress} />
    );

    fireEvent.press(getByText('Morning Run'));
    expect(onItemPress).toHaveBeenCalledWith(mockItems[0]);
  });

  it('shows metrics when available', () => {
    const { getByText } = render(<Timeline items={mockItems} showMetrics />);
    
    expect(getByText('5 miles')).toBeTruthy();
    expect(getByText('45 min')).toBeTruthy();
    expect(getByText('easy')).toBeTruthy();
  });

  it('shows completion status', () => {
    const { getByText } = render(<Timeline items={mockItems} showStatus />);
    
    expect(getByText('Completed')).toBeTruthy();
    expect(getByText('Scheduled')).toBeTruthy();
  });

  it('applies custom styles', () => {
    const customStyle = { backgroundColor: '#F5F5F5' };
    const { getByTestId } = render(
      <Timeline items={mockItems} style={customStyle} />
    );

    const container = getByTestId('timeline-container');
    expect(container.props.style).toContainEqual(customStyle);
  });

  it('hides dates when showDates is false', () => {
    const { queryByText } = render(
      <Timeline items={mockItems} showDates={false} />
    );
    
    expect(queryByText('Mar 20')).toBeNull();
    expect(queryByText('Mar 21')).toBeNull();
    expect(queryByText('Mar 22')).toBeNull();
  });

  it('hides icons when showIcons is false', () => {
    const { queryByTestId } = render(
      <Timeline items={mockItems} showIcons={false} />
    );
    
    expect(queryByTestId('timeline-icon')).toBeNull();
  });

  it('handles empty items array', () => {
    const { container } = render(<Timeline items={[]} />);
    expect(container.children).toHaveLength(1); // Only the ScrollView
  });
}); 