import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { Icon } from '../Icon';

export interface Column<T> {
  key: string;
  title: string;
  width?: number;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
}

export interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
  style?: ViewStyle;
  rowStyle?: ViewStyle;
  headerStyle?: ViewStyle;
  cellStyle?: ViewStyle;
  emptyState?: React.ReactNode;
}

export const Table = <T extends Record<string, any>>({
  data,
  columns,
  onSort,
  sortKey,
  sortDirection,
  style,
  rowStyle,
  headerStyle,
  cellStyle,
  emptyState,
}: TableProps<T>) => {
  const theme = useTheme();

  const handleSort = (key: string) => {
    if (!onSort) return;
    const newDirection = sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(key, newDirection);
  };

  const styles = StyleSheet.create({
    container: {
      borderWidth: 1,
      borderColor: theme.colors.primary,
      borderRadius: 8,
      overflow: 'hidden',
      ...style,
    },
    header: {
      flexDirection: 'row',
      backgroundColor: theme.colors.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.primary,
      ...headerStyle,
    },
    headerCell: {
      padding: 16,
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    headerText: {
      color: theme.colors.text,
      fontSize: theme.typography.fontSize.bodySmall,
      fontWeight: '600',
    },
    row: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.primary,
      ...rowStyle,
    },
    cell: {
      padding: 16,
      flex: 1,
      ...cellStyle,
    },
    cellText: {
      color: theme.colors.text,
      fontSize: theme.typography.fontSize.bodySmall,
    },
    sortIcon: {
      marginLeft: 4,
    },
    emptyState: {
      padding: 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyStateText: {
      color: theme.colors.text,
      fontSize: theme.typography.fontSize.bodyMedium,
    },
  });

  if (data.length === 0) {
    return (
      <View style={[styles.container, styles.emptyState]}>
        {emptyState || (
          <Text style={styles.emptyStateText}>No data available</Text>
        )}
      </View>
    );
  }

  return (
    <ScrollView horizontal style={styles.container}>
      <View>
        {/* Header */}
        <View style={styles.header}>
          {columns.map((column) => (
            <TouchableOpacity
              key={column.key}
              style={[
                styles.headerCell,
                column.width ? { width: column.width } : undefined,
              ]}
              onPress={() => column.sortable && handleSort(column.key)}
              disabled={!column.sortable}
            >
              <Text style={styles.headerText}>{column.title}</Text>
              {column.sortable && sortKey === column.key && (
                <Icon
                  name={sortDirection === 'asc' ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color={theme.colors.primary}
                  style={styles.sortIcon}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Rows */}
        {data.map((item, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {columns.map((column) => (
              <View
                key={column.key}
                style={[
                  styles.cell,
                  column.width ? { width: column.width } : undefined,
                ]}
              >
                {column.render ? (
                  column.render(item)
                ) : (
                  <Text style={styles.cellText}>
                    {item[column.key]?.toString() || '-'}
                  </Text>
                )}
              </View>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}; 