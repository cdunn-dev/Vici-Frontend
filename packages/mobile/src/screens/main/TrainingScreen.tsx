import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TrainingScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Training</Text>
        </View>
        
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Current Training Plan</Text>
        </View>
        
        <View style={styles.planCard}>
          <Text style={styles.planName}>10K Training Plan</Text>
          <Text style={styles.planProgress}>Week 3 of 8</Text>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: '37.5%' }]} />
          </View>
          <TouchableOpacity style={styles.viewPlanButton}>
            <Text style={styles.viewPlanText}>View Plan</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Next Workout</Text>
        </View>
        
        <TouchableOpacity style={styles.workoutCard}>
          <Text style={styles.workoutTitle}>Interval Training</Text>
          <Text style={styles.workoutDescription}>
            8 x 400m repeats with 200m recovery jog
          </Text>
          <View style={styles.workoutDetailRow}>
            <Text style={styles.workoutDetail}>Duration: ~45 minutes</Text>
            <Text style={styles.workoutDetail}>Difficulty: Medium</Text>
          </View>
          <View style={styles.workoutActions}>
            <TouchableOpacity style={styles.workoutActionButton}>
              <Text style={styles.workoutActionText}>Start</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.workoutActionButton, styles.workoutActionButtonOutline]}>
              <Text style={styles.workoutActionTextOutline}>Reschedule</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.createPlanButton}>
            <Text style={styles.createPlanText}>Create New Plan</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.viewHistoryButton}>
            <Text style={styles.viewHistoryText}>View History</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
  },
  sectionHeader: {
    marginVertical: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  planCard: {
    backgroundColor: '#F8F4FF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  planProgress: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: '#E0D8FD',
    borderRadius: 5,
    marginBottom: 15,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#5224EF',
    borderRadius: 5,
  },
  viewPlanButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#5224EF',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  viewPlanText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  workoutCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E2E2',
  },
  workoutTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  workoutDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
    lineHeight: 20,
  },
  workoutDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  workoutDetail: {
    fontSize: 12,
    color: '#666666',
  },
  workoutActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  workoutActionButton: {
    backgroundColor: '#5224EF',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginRight: 10,
  },
  workoutActionButtonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#5224EF',
  },
  workoutActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  workoutActionTextOutline: {
    color: '#5224EF',
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtons: {
    marginTop: 10,
  },
  createPlanButton: {
    backgroundColor: '#5224EF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 10,
  },
  createPlanText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  viewHistoryButton: {
    backgroundColor: '#F8F4FF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  viewHistoryText: {
    color: '#5224EF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 