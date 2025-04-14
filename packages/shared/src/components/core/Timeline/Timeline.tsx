import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ViewStyle } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { Icon } from '../Icon';

export type TimelineItemType = 'workout' | 'rest' | 'race' | 'milestone' | 'event';

export interface TimelineItem {
  id: string;
  date: Date;
  type: TimelineItemType;
  title: string;
  description?: string;
  distance?: number;
  duration?: number;
  intensity?: 'easy' | 'moderate' | 'hard';
  completed?: boolean;
  isRace?: boolean;
  isMilestone?: boolean;
}

export interface TimelineProps {
  items: TimelineItem[];
  onItemPress?: (item: TimelineItem) => void;
  style?: ViewStyle;
  showDates?: boolean;
  showIcons?: boolean;
  showStatus?: boolean;
  showMetrics?: boolean;
  groupBy?: 'day' | 'week' | 'month';
}

export const Timeline: React.FC<TimelineProps> = ({
  items,
  onItemPress,
  style,
  showDates = true,
  showIcons = true,
  showStatus = true,
  showMetrics = true,
  groupBy = 'day',
}) => {
  const theme = useTheme();

  const getItemColor = (type: TimelineItemType) => {
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

  const getItemIcon = (type: TimelineItemType) => {
    switch (type) {
      case 'workout':
        return 'running';
      case 'rest':
        return 'bed';
      case 'race':
        return 'flag';
      case 'milestone':
        return 'star';
      case 'event':
        return 'calendar';
      default:
        return 'circle';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      ...(groupBy === 'week' && { weekday: 'short' }),
    });
  };

  const groupItems = () => {
    const grouped: { [key: string]: TimelineItem[] } = {};
    
    items.forEach((item) => {
      let key = '';
      switch (groupBy) {
        case 'day':
          key = item.date.toDateString();
          break;
        case 'week':
          const weekStart = new Date(item.date);
          weekStart.setDate(item.date.getDate() - item.date.getDay());
          key = weekStart.toDateString();
          break;
        case 'month':
          key = `${item.date.getFullYear()}-${item.date.getMonth()}`;
          break;
      }
      
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(item);
    });

    return grouped;
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      ...style,
    },
    group: {
      marginBottom: theme.spacing.lg,
    },
    groupHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
    },
    groupTitle: {
      fontSize: theme.typography.fontSize.bodyMedium,
      fontWeight: '600',
      color: theme.colors.text,
    },
    item: {
      flexDirection: 'row',
      padding: theme.spacing.md,
      borderLeftWidth: 2,
      borderLeftColor: theme.colors.border,
      marginLeft: theme.spacing.md,
    },
    itemContent: {
      flex: 1,
      marginLeft: theme.spacing.md,
    },
    itemHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.xs,
    },
    itemTitle: {
      fontSize: theme.typography.fontSize.bodyMedium,
      fontWeight: '500',
      color: theme.colors.text,
      flex: 1,
    },
    itemDescription: {
      fontSize: theme.typography.fontSize.bodySmall,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xs,
    },
    itemMetrics: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.spacing.xs,
    },
    metric: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: theme.spacing.md,
    },
    metricText: {
      fontSize: theme.typography.fontSize.bodySmall,
      color: theme.colors.textSecondary,
      marginLeft: theme.spacing.xs,
    },
    status: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.spacing.xs,
    },
    statusText: {
      fontSize: theme.typography.fontSize.bodySmall,
      marginLeft: theme.spacing.xs,
    },
    icon: {
      marginRight: theme.spacing.sm,
    },
  });

  const groupedItems = groupItems();

  return (
    <ScrollView style={styles.container}>
      {Object.entries(groupedItems).map(([date, items]) => (
        <View key={date} style={styles.group}>
          {showDates && (
            <View style={styles.groupHeader}>
              <Text style={styles.groupTitle}>
                {formatDate(new Date(date))}
              </Text>
            </View>
          )}
          {items.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.item,
                { borderLeftColor: getItemColor(item.type) },
              ]}
              onPress={() => onItemPress?.(item)}
            >
              {showIcons && (
                <Icon
                  name={getItemIcon(item.type)}
                  size={20}
                  color={getItemColor(item.type)}
                  style={styles.icon}
                />
              )}
              <View style={styles.itemContent}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                </View>
                {item.description && (
                  <Text style={styles.itemDescription}>
                    {item.description}
                  </Text>
                )}
                {showMetrics && (item.distance || item.duration) && (
                  <View style={styles.itemMetrics}>
                    {item.distance && (
                      <View style={styles.metric}>
                        <Icon name="map-marker-distance" size={16} color={theme.colors.textSecondary} />
                        <Text style={styles.metricText}>
                          {item.distance} {item.distance > 1 ? 'miles' : 'mile'}
                        </Text>
                      </View>
                    )}
                    {item.duration && (
                      <View style={styles.metric}>
                        <Icon name="clock" size={16} color={theme.colors.textSecondary} />
                        <Text style={styles.metricText}>
                          {Math.floor(item.duration / 60)} min
                        </Text>
                      </View>
                    )}
                    {item.intensity && (
                      <View style={styles.metric}>
                        <Icon name="speedometer" size={16} color={theme.colors.textSecondary} />
                        <Text style={styles.metricText}>
                          {item.intensity}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
                {showStatus && item.completed !== undefined && (
                  <View style={styles.status}>
                    <Icon
                      name={item.completed ? 'check-circle' : 'clock'}
                      size={16}
                      color={item.completed ? theme.colors.success : theme.colors.warning}
                    />
                    <Text
                      style={[
                        styles.statusText,
                        { color: item.completed ? theme.colors.success : theme.colors.warning },
                      ]}
                    >
                      {item.completed ? 'Completed' : 'Scheduled'}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}; 