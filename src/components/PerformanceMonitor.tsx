import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { performanceMonitor } from '../utils/performance';
import { useTheme } from '../hooks/useTheme';

export const PerformanceMonitor: React.FC = () => {
  const theme = useTheme();
  const [metrics, setMetrics] = useState(performanceMonitor.getMetrics());

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(performanceMonitor.getMetrics());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: theme.colors.background,
    },
    section: {
      marginBottom: 16,
      padding: 16,
      backgroundColor: theme.colors.surface,
      borderRadius: 8,
      elevation: 2,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 8,
      color: theme.colors.text,
    },
    metric: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    label: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    value: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text,
    },
  });

  const formatTime = (ms: number) => `${ms.toFixed(2)}ms`;
  const formatMemory = (mb: number) => `${mb.toFixed(2)}MB`;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>App Performance</Text>
        <View style={styles.metric}>
          <Text style={styles.label}>Uptime</Text>
          <Text style={styles.value}>
            {formatTime(Date.now() - metrics.appStartTime)}
          </Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.label}>Last Update</Text>
          <Text style={styles.value}>
            {new Date(metrics.lastUpdate).toLocaleTimeString()}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Screen Load Times</Text>
        {Object.entries(metrics.screenLoadTimes).map(([screen, time]) => (
          <View key={screen} style={styles.metric}>
            <Text style={styles.label}>{screen}</Text>
            <Text style={styles.value}>{formatTime(time)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>API Response Times</Text>
        {Object.entries(metrics.apiResponseTimes).map(([endpoint, times]) => (
          <View key={endpoint} style={styles.metric}>
            <Text style={styles.label}>{endpoint}</Text>
            <Text style={styles.value}>
              {formatTime(performanceMonitor.getAverageResponseTime(endpoint))}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Memory Usage</Text>
        {metrics.memoryUsage.length > 0 && (
          <View style={styles.metric}>
            <Text style={styles.label}>Current</Text>
            <Text style={styles.value}>
              {formatMemory(metrics.memoryUsage[metrics.memoryUsage.length - 1])}
            </Text>
          </View>
        )}
        {metrics.memoryUsage.length > 1 && (
          <View style={styles.metric}>
            <Text style={styles.label}>Average</Text>
            <Text style={styles.value}>
              {formatMemory(
                metrics.memoryUsage.reduce((a, b) => a + b, 0) /
                  metrics.memoryUsage.length
              )}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}; 