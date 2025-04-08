import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Calendar } from '../Calendar';
import { useTheme } from '../../../../hooks/useTheme';

// Mock the useTheme hook
jest.mock('../../../../hooks/useTheme', () => ({
  useTheme: jest.fn(),
}));

describe('Calendar', () => {
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
    borderRadius: {
      sm: 4,
      md: 8,
      lg: 12,
    },
  };

  beforeEach(() => {
    (useTheme as jest.Mock).mockReturnValue(mockTheme);
  });

  const mockEvents = [
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
  ];

  it('renders correctly with default props', () => {
    const { getByText } = render(<Calendar />);
    
    expect(getByText(format(new Date(), 'MMMM yyyy'))).toBeTruthy();
    expect(getByText('Sun')).toBeTruthy();
    expect(getByText('Mon')).toBeTruthy();
    expect(getByText('Tue')).toBeTruthy();
    expect(getByText('Wed')).toBeTruthy();
    expect(getByText('Thu')).toBeTruthy();
    expect(getByText('Fri')).toBeTruthy();
    expect(getByText('Sat')).toBeTruthy();
  });

  it('handles month navigation', () => {
    const { getByText, getByTestId } = render(<Calendar />);
    
    const prevButton = getByTestId('calendar-prev-button');
    const nextButton = getByTestId('calendar-next-button');
    
    fireEvent.press(nextButton);
    expect(getByText(format(addMonths(new Date(), 1), 'MMMM yyyy'))).toBeTruthy();
    
    fireEvent.press(prevButton);
    expect(getByText(format(new Date(), 'MMMM yyyy'))).toBeTruthy();
  });

  it('handles date press events', () => {
    const onDatePress = jest.fn();
    const { getByText } = render(
      <Calendar onDatePress={onDatePress} />
    );

    const today = getByText(format(new Date(), 'd'));
    fireEvent.press(today);
    expect(onDatePress).toHaveBeenCalled();
  });

  it('displays events with dots', () => {
    const { getByTestId } = render(
      <Calendar events={mockEvents} showEventDots />
    );

    const eventDot = getByTestId('event-dot-1');
    expect(eventDot).toBeTruthy();
  });

  it('shows event details on long press', () => {
    const { getByText, getByTestId } = render(
      <Calendar events={mockEvents} showEventDetails />
    );

    const dayWithEvent = getByText('20');
    fireEvent(dayWithEvent, 'longPress');
    
    expect(getByText('Morning Run')).toBeTruthy();
  });

  it('handles event press', () => {
    const onEventPress = jest.fn();
    const { getByText, getByTestId } = render(
      <Calendar events={mockEvents} onEventPress={onEventPress} showEventDetails />
    );

    const dayWithEvent = getByText('20');
    fireEvent(dayWithEvent, 'longPress');
    
    const event = getByText('Morning Run');
    fireEvent.press(event);
    
    expect(onEventPress).toHaveBeenCalledWith(mockEvents[0]);
  });

  it('applies custom styles', () => {
    const customStyle = { backgroundColor: '#F5F5F5' };
    const { getByTestId } = render(
      <Calendar style={customStyle} />
    );

    const container = getByTestId('calendar-container');
    expect(container.props.style).toContainEqual(customStyle);
  });

  it('handles empty events array', () => {
    const { container } = render(<Calendar events={[]} />);
    expect(container.children).toHaveLength(1);
  });

  it('respects min and max date constraints', () => {
    const minDate = new Date('2024-03-01');
    const maxDate = new Date('2024-03-31');
    const { getByTestId } = render(
      <Calendar minDate={minDate} maxDate={maxDate} />
    );

    const prevButton = getByTestId('calendar-prev-button');
    const nextButton = getByTestId('calendar-next-button');
    
    fireEvent.press(prevButton);
    expect(getByText(format(minDate, 'MMMM yyyy'))).toBeTruthy();
    
    fireEvent.press(nextButton);
    expect(getByText(format(maxDate, 'MMMM yyyy'))).toBeTruthy();
  });
}); 