import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  // Dummy user data
  const user = {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    profilePicture: 'https://via.placeholder.com/150',
    dateJoined: 'January 2023',
    stats: {
      totalWorkouts: 48,
      totalDistance: 325.2,
      totalTime: '42h 15m',
    },
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <Image
              source={{ uri: user.profilePicture }}
              style={styles.profilePicture}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user.name}</Text>
              <Text style={styles.profileEmail}>{user.email}</Text>
              <Text style={styles.profileDate}>Member since {user.dateJoined}</Text>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user.stats.totalWorkouts}</Text>
              <Text style={styles.statLabel}>Workouts</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user.stats.totalDistance}</Text>
              <Text style={styles.statLabel}>Kilometers</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user.stats.totalTime}</Text>
              <Text style={styles.statLabel}>Active Time</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Settings</Text>
        </View>

        <View style={styles.settingsCard}>
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingText}>Account Settings</Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingText}>Notification Preferences</Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingText}>Privacy Settings</Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingText}>Connected Services</Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>App</Text>
        </View>

        <View style={styles.settingsCard}>
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingText}>Help & Support</Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingText}>About Vici</Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingText}>Terms of Service</Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingText}>Privacy Policy</Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton}>
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
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
  editButton: {
    padding: 8,
  },
  editButtonText: {
    color: '#5224EF',
    fontSize: 16,
    fontWeight: '500',
  },
  profileCard: {
    backgroundColor: '#F8F4FF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profilePicture: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  profileDate: {
    fontSize: 12,
    color: '#999999',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#E0D8FD',
    paddingTop: 15,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5224EF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
  },
  sectionHeader: {
    marginVertical: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  settingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E2E2',
  },
  settingText: {
    fontSize: 16,
    color: '#333333',
  },
  settingArrow: {
    fontSize: 20,
    color: '#999999',
  },
  logoutButton: {
    backgroundColor: '#F2F2F2',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginVertical: 20,
  },
  logoutButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
  },
}); 