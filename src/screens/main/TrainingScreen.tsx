import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from '../../types/navigation';
import { useTheme } from '../../contexts/ThemeContext';

type Props = BottomTabScreenProps<MainTabParamList, 'Training'>;

const TrainingScreen: React.FC<Props> = () => {
  const { theme } = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Training</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Your workout programs and progress
        </Text>
      </View>

      <View style={styles.content}>
        {/* Add your content here */}
        <Text style={[styles.text, { color: theme.text }]}>
          Training content coming soon...
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  content: {
    padding: 20,
  },
  text: {
    fontSize: 16,
  },
});

export default TrainingScreen; 