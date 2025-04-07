import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Layout from '../components/Layout';
import Button from '../components/Button';
import { theme } from '../utils/theme';

const WorkoutScreen = () => {
  return (
    <Layout>
      <ScrollView style={styles.container}>
        <Text style={[styles.title, theme.typography.h2]}>Today's Workout</Text>
        
        <View style={styles.workoutCard}>
          <Text style={[styles.workoutTitle, theme.typography.h3]}>
            Upper Body Strength
          </Text>
          <Text style={[styles.workoutDescription, theme.typography.body]}>
            Focus on building strength in your upper body with these exercises.
          </Text>
          
          <View style={styles.exerciseList}>
            <Text style={[styles.exerciseTitle, theme.typography.body]}>
              Exercises:
            </Text>
            <Text style={[styles.exerciseItem, theme.typography.body]}>
              • Bench Press - 3 sets x 8 reps
            </Text>
            <Text style={[styles.exerciseItem, theme.typography.body]}>
              • Shoulder Press - 3 sets x 10 reps
            </Text>
            <Text style={[styles.exerciseItem, theme.typography.body]}>
              • Bicep Curls - 3 sets x 12 reps
            </Text>
          </View>

          <Button
            title="Start Workout"
            onPress={() => console.log('Start Workout pressed')}
            variant="primary"
            style={styles.button}
          />
        </View>
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    marginBottom: theme.spacing.lg,
  },
  workoutCard: {
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  workoutTitle: {
    marginBottom: theme.spacing.sm,
  },
  workoutDescription: {
    marginBottom: theme.spacing.lg,
    color: theme.colors.textSecondary,
  },
  exerciseList: {
    marginBottom: theme.spacing.xl,
  },
  exerciseTitle: {
    marginBottom: theme.spacing.sm,
    fontWeight: 'bold',
  },
  exerciseItem: {
    marginBottom: theme.spacing.sm,
    marginLeft: theme.spacing.md,
  },
  button: {
    marginTop: theme.spacing.md,
  },
});

export default WorkoutScreen; 