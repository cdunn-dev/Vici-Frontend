import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Define activity type
type Activity = {
  id: string;
  type: string;
  title: string;
  date: string;
  distance?: string;
  duration: string;
  pace?: string;
};

// Dummy data for demonstration
const recentActivities: Activity[] = [
  {
    id: '1',
    type: 'Run',
    title: 'Morning Run',
    date: '2023-04-07',
    distance: '5.2 km',
    duration: '28:35',
    pace: '5:30/km',
  },
  {
    id: '2',
    type: 'Strength',
    title: 'Full Body Workout',
    date: '2023-04-05',
    duration: '45:12',
  },
  {
    id: '3',
    type: 'Run',
    title: 'Interval Training',
    date: '2023-04-03',
    distance: '6.3 km',
    duration: '35:10',
    pace: '5:35/km',
  },
  {
    id: '4',
    type: 'Cycling',
    title: 'Evening Ride',
    date: '2023-04-01',
    distance: '15.7 km',
    duration: '42:20',
    pace: '22.3 km/h',
  },
];

export default function ActivityScreen() {
  // Format date to a more readable format
  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = { 
      month: 'short' as const, 
      day: 'numeric' as const 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Render individual activity item
  const renderActivityItem = ({ item }: { item: Activity }) => (
    <TouchableOpacity style={styles.activityCard}>
      <View style={styles.activityHeader}>
        <View style={styles.activityTypeContainer}>
          <Text style={styles.activityType}>{item.type}</Text>
        </View>
        <Text style={styles.activityDate}>{formatDate(item.date)}</Text>
      </View>
      
      <Text style={styles.activityTitle}>{item.title}</Text>
      
      <View style={styles.activityDetails}>
        <View style={styles.activityDetail}>
          <Text style={styles.activityDetailLabel}>Duration</Text>
          <Text style={styles.activityDetailValue}>{item.duration}</Text>
        </View>
        
        {item.distance && (
          <View style={styles.activityDetail}>
            <Text style={styles.activityDetailLabel}>Distance</Text>
            <Text style={styles.activityDetailValue}>{item.distance}</Text>
          </View>
        )}
        
        {item.pace && (
          <View style={styles.activityDetail}>
            <Text style={styles.activityDetailLabel}>Pace</Text>
            <Text style={styles.activityDetailValue}>{item.pace}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Activity</Text>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterButtonText}>Filter</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.activitySummary}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>12</Text>
            <Text style={styles.summaryLabel}>Activities</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>42.5</Text>
            <Text style={styles.summaryLabel}>Kilometers</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>4h 12m</Text>
            <Text style={styles.summaryLabel}>Time</Text>
          </View>
        </View>
        
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activities</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={recentActivities}
          keyExtractor={(item) => item.id}
          renderItem={renderActivityItem}
          contentContainerStyle={styles.activitiesList}
          showsVerticalScrollIndicator={false}
        />
        
        <TouchableOpacity style={styles.logActivityButton}>
          <Text style={styles.logActivityText}>Log New Activity</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterButtonText: {
    color: '#5224EF',
    fontSize: 16,
    fontWeight: '500',
  },
  activitySummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8F4FF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5224EF',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666666',
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
  activitiesList: {
    paddingBottom: 20,
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E2E2E2',
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  activityTypeContainer: {
    backgroundColor: '#E0D8FD',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  activityType: {
    fontSize: 12,
    color: '#5224EF',
    fontWeight: '500',
  },
  activityDate: {
    fontSize: 12,
    color: '#666666',
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 10,
  },
  activityDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  activityDetail: {
    alignItems: 'center',
  },
  activityDetailLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 2,
  },
  activityDetailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
  logActivityButton: {
    backgroundColor: '#5224EF',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  logActivityText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 