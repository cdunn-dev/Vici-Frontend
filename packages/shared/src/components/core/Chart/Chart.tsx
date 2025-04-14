import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/useTheme';

export interface ChartProps {
  /** Chart title */
  title?: string;
  /** Chart data - placeholder for now */
  data?: any[];
  /** Chart type */
  type?: 'line' | 'bar' | 'pie';
  /** Chart height */
  height?: number;
  /** Chart width */
  width?: number;
  /** Additional chart options */
  options?: Record<string, any>;
  /** Test ID for testing */
  testID?: string;
}

/**
 * A placeholder Chart component
 * In a real implementation, this would use a charting library
 */
export const Chart: React.FC<ChartProps> = ({
  title,
  data = [],
  type = 'line',
  height = 200,
  width,
  options,
  testID = 'chart',
}) => {
  const theme = useTheme();
  
  const styles = StyleSheet.create({
    container: {
      height,
      width: width || '100%',
      padding: theme.spacing.md,
      backgroundColor: theme.colors.background,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    title: {
      fontSize: theme.typography.fontSize.bodyLarge,
      fontWeight: 'bold',
      marginBottom: theme.spacing.sm,
      color: theme.colors.text,
    },
    placeholder: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    placeholderText: {
      color: theme.colors.textSecondary,
    },
  });

  return (
    <View style={styles.container} testID={testID}>
      {title && <Text style={styles.title}>{title}</Text>}
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>
          Chart ({type}) - Placeholder
        </Text>
      </View>
    </View>
  );
}; 