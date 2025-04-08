import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainTabParamList } from '../../navigation/MainNavigator';

type HomeScreenProps = NativeStackScreenProps<MainTabParamList, 'Home'>;

export default function HomeScreen({ navigation }: HomeScreenProps) {
  // Dummy data for demonstration
  const userFirstName = 'Sarah';
  const progressPercent = 68;
  const upcomingWorkouts = [
    {
      id: '1',
      title: 'Morning Run',
      time: '7:00 AM',
      duration: '30 min',
      type: 'Run',
      distance: '5 km',
    },
    {
      id: '2',
      title: 'Strength Training',
      time: '6:00 PM',
      duration: '45 min',
      type: 'Strength',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Hello, {userFirstName}!</Text>
          <Text style={styles.date}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>

        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>Weekly Progress</Text>
          <View style={styles.progressBarContainer}>
            <View
              style={[styles.progressBar, { width: `${progressPercent}%` }]}
            />
          </View>
          <Text style={styles.progressText}>{progressPercent}% complete</Text>
          <TouchableOpacity style={styles.viewDetailsButton}>
            <Text style={styles.viewDetailsText}>View Details</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Workouts</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {upcomingWorkouts.length > 0 ? (
          upcomingWorkouts.map((workout) => (
            <TouchableOpacity key={workout.id} style={styles.workoutCard}>
              <View style={styles.workoutLeft}>
                <Text style={styles.workoutTime}>{workout.time}</Text>
                <Text style={styles.workoutDuration}>{workout.duration}</Text>
              </View>
              <View style={styles.workoutRight}>
                <Text style={styles.workoutTitle}>{workout.title}</Text>
                <View style={styles.workoutDetails}>
                  <View style={styles.workoutTypeBadge}>
                    <Text style={styles.workoutTypeText}>{workout.type}</Text>
                  </View>
                  {workout.distance && (
                    <Text style={styles.workoutDistance}>{workout.distance}</Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyWorkouts}>
            <Text style={styles.emptyWorkoutsText}>
              No workouts scheduled for today
            </Text>
            <TouchableOpacity style={styles.addWorkoutButton}>
              <Text style={styles.addWorkoutText}>Add Workout</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickActionButton}>
            <Text style={styles.quickActionText}>Record Workout</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionButton}>
            <Text style={styles.quickActionText}>Training Plan</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionButton}>
            <Text style={styles.quickActionText}>Analytics</Text>
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  header: {
    marginTop: 20,
    marginBottom: 30,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
  },
  date: {
    fontSize: 16,
    color: '#666666',
    marginTop: 4,
  },
  progressCard: {
    backgroundColor: '#F8F4FF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 15,
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: '#E0D8FD',
    borderRadius: 5,
    marginBottom: 10,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#5224EF',
    borderRadius: 5,
  },
  progressText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 15,
  },
  viewDetailsButton: {
    alignSelf: 'flex-start',
  },
  viewDetailsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5224EF',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  seeAllText: {
    fontSize: 14,
    color: '#5224EF',
  },
  workoutCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E2E2E2',
  },
  workoutLeft: {
    paddingRight: 15,
    borderRightWidth: 1,
    borderRightColor: '#E2E2E2',
    justifyContent: 'center',
    minWidth: 70,
  },
  workoutTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  workoutDuration: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
  workoutRight: {
    flex: 1,
    paddingLeft: 15,
    justifyContent: 'center',
  },
  workoutTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 6,
  },
  workoutDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workoutTypeBadge: {
    backgroundColor: '#E0D8FD',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  workoutTypeText: {
    fontSize: 12,
    color: '#5224EF',
    fontWeight: '500',
  },
  workoutDistance: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 8,
  },
  emptyWorkouts: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 30,
  },
  emptyWorkoutsText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 15,
  },
  addWorkoutButton: {
    backgroundColor: '#5224EF',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  addWorkoutText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  quickActionButton: {
    backgroundColor: '#F8F4FF',
    borderRadius: 8,
    padding: 12,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#5224EF',
  },
}); 