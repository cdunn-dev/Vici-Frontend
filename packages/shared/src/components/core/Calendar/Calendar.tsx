import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { Icon } from '../Icon';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';

export type CalendarEventType = 'workout' | 'rest' | 'race' | 'milestone' | 'event';

export interface CalendarEvent {
  id: string;
  date: Date;
  type: CalendarEventType;
  title: string;
  description?: string;
  distance?: number;
  duration?: number;
  intensity?: 'easy' | 'moderate' | 'hard';
  completed?: boolean;
  isRace?: boolean;
  isMilestone?: boolean;
}

export interface CalendarProps {
  events?: CalendarEvent[];
  onDatePress?: (date: Date) => void;
  onEventPress?: (event: CalendarEvent) => void;
  style?: ViewStyle;
  showWeekNumbers?: boolean;
  showEventDots?: boolean;
  showEventDetails?: boolean;
  initialDate?: Date;
  minDate?: Date;
  maxDate?: Date;
}

export const Calendar: React.FC<CalendarProps> = ({
  events = [],
  onDatePress,
  onEventPress,
  style,
  showWeekNumbers = false,
  showEventDots = true,
  showEventDetails = false,
  initialDate = new Date(),
  minDate,
  maxDate,
}) => {
  const theme = useTheme();
  const [currentDate, setCurrentDate] = useState(initialDate);

  const getEventColor = (type: CalendarEventType) => {
    switch (type) {
      case 'workout':
        return theme.colors.primary;
      case 'rest':
        return theme.colors.success;
      case 'race':
        return theme.colors.error;
      case 'milestone':
        return theme.colors.warning;
      case 'event':
        return theme.colors.secondary;
      default:
        return theme.colors.primary;
    }
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => isSameDay(event.date, date));
  };

  const handleDatePress = (date: Date) => {
    if (onDatePress) {
      onDatePress(date);
    }
  };

  const handleEventPress = (event: CalendarEvent) => {
    if (onEventPress) {
      onEventPress(event);
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => addMonths(prev, 1));
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const styles = StyleSheet.create({
    container: {
      ...style,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing.md,
    },
    monthTitle: {
      fontSize: theme.typography.fontSize.bodyLarge,
      fontWeight: '600',
      color: theme.colors.text,
    },
    navigationButton: {
      padding: theme.spacing.sm,
    },
    weekDays: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    weekDay: {
      fontSize: theme.typography.fontSize.bodySmall,
      fontWeight: '500',
      color: theme.colors.textSecondary,
      width: 40,
      textAlign: 'center',
    },
    daysContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    day: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      margin: 2,
    },
    dayText: {
      fontSize: theme.typography.fontSize.bodyMedium,
      color: theme.colors.text,
    },
    dayTextInactive: {
      color: theme.colors.textSecondary,
    },
    dayTextToday: {
      fontWeight: 'bold',
      color: theme.colors.primary,
    },
    eventDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginTop: 2,
    },
    eventDetails: {
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.sm,
      zIndex: 1,
    },
    eventItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.xs,
    },
    eventTitle: {
      fontSize: theme.typography.fontSize.bodySmall,
      color: theme.colors.text,
      marginLeft: theme.spacing.sm,
    },
  });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.navigationButton}
          onPress={handlePrevMonth}
        >
          <Icon name="chevron-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.monthTitle}>
          {format(currentDate, 'MMMM yyyy')}
        </Text>
        <TouchableOpacity
          style={styles.navigationButton}
          onPress={handleNextMonth}
        >
          <Icon name="chevron-right" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.weekDays}>
        {weekDays.map(day => (
          <Text key={day} style={styles.weekDay}>
            {day}
          </Text>
        ))}
      </View>

      <View style={styles.daysContainer}>
        {days.map((day, index) => {
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isToday = isSameDay(day, new Date());
          const dayEvents = getEventsForDate(day);
          const [showDetails, setShowDetails] = useState(false);

          return (
            <TouchableOpacity
              key={day.toString()}
              style={styles.day}
              onPress={() => handleDatePress(day)}
              onLongPress={() => setShowDetails(!showDetails)}
            >
              <Text
                style={[
                  styles.dayText,
                  !isCurrentMonth && styles.dayTextInactive,
                  isToday && styles.dayTextToday,
                ]}
              >
                {format(day, 'd')}
              </Text>
              {showEventDots && dayEvents.length > 0 && (
                <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                  {dayEvents.map(event => (
                    <View
                      key={event.id}
                      style={[
                        styles.eventDot,
                        { backgroundColor: getEventColor(event.type) },
                      ]}
                    />
                  ))}
                </View>
              )}
              {showEventDetails && showDetails && dayEvents.length > 0 && (
                <View style={styles.eventDetails}>
                  {dayEvents.map(event => (
                    <TouchableOpacity
                      key={event.id}
                      style={styles.eventItem}
                      onPress={() => handleEventPress(event)}
                    >
                      <View
                        style={[
                          styles.eventDot,
                          { backgroundColor: getEventColor(event.type) },
                        ]}
                      />
                      <Text style={styles.eventTitle}>{event.title}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}; 