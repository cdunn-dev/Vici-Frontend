import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainTabParamList } from '../navigation/types';
import { useProfile, useUpdateProfile } from '../services/api/user';
import { theme } from '../utils/theme';
import Text from '../components/Text';
import Button from '../components/Button';
import Icon from '../components/Icon';
import Card from '../components/Card';
import Tabs from '../components/Tabs';
import Badge from '../components/Badge';
import ProgressBar from '../components/ProgressBar';
import Alert from '../components/Alert';

type ProfileScreenNavigationProp = NativeStackNavigationProp<MainTabParamList, 'Profile'>;

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
}

const ProfileScreen = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { data: profile, isLoading, error } = useProfile();
  const updateProfile = useUpdateProfile();
  const [activeTab, setActiveTab] = useState('profile');

  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  const handleEditRunnerProfile = () => {
    navigation.navigate('EditRunnerProfile');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Icon name="refresh" size={24} color="primary" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Alert
          type="error"
          title="Error"
          message="Failed to load profile data"
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: profile?.avatar || 'https://via.placeholder.com/100' }}
            style={styles.avatar}
          />
          <TouchableOpacity style={styles.editAvatarButton}>
            <Icon name="edit" size={16} color="white" />
          </TouchableOpacity>
        </View>
        <Text variant="h2" style={styles.name}>{profile?.name}</Text>
        <Text variant="body" color="textSecondary">{profile?.email}</Text>
      </View>

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: 'profile', label: 'User Profile' },
          { id: 'runner', label: 'Runner Profile' },
          { id: 'training', label: 'Training Plans' },
          { id: 'achievements', label: 'Achievements' },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        style={styles.tabs}
      />

      {/* Profile Content */}
      <View style={styles.content}>
        {activeTab === 'profile' && (
          <Card style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text variant="h3">Personal Information</Text>
              <Button
                variant="text"
                onPress={handleEditProfile}
                style={styles.editButton}
              >
                Edit
              </Button>
            </View>
            <View style={styles.infoRow}>
              <Text variant="body" color="textSecondary">Date of Birth</Text>
              <Text variant="body">{profile?.dateOfBirth || 'Not set'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text variant="body" color="textSecondary">Gender</Text>
              <Text variant="body">{profile?.gender || 'Not set'}</Text>
            </View>
          </Card>
        )}

        {activeTab === 'runner' && (
          <Card style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text variant="h3">Runner Profile</Text>
              <Button
                variant="text"
                onPress={handleEditRunnerProfile}
                style={styles.editButton}
              >
                Edit
              </Button>
            </View>
            <View style={styles.infoRow}>
              <Text variant="body" color="textSecondary">Level</Text>
              <Text variant="body">{profile?.runnerProfile?.level || 'Beginner'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text variant="body" color="textSecondary">Personal Bests</Text>
              <View style={styles.pbContainer}>
                <Text variant="body">5K: {profile?.runnerProfile?.personalBests?.fiveK || '--:--'}</Text>
                <Text variant="body">10K: {profile?.runnerProfile?.personalBests?.tenK || '--:--'}</Text>
                <Text variant="body">Half: {profile?.runnerProfile?.personalBests?.halfMarathon || '--:--'}</Text>
                <Text variant="body">Full: {profile?.runnerProfile?.personalBests?.marathon || '--:--'}</Text>
              </View>
            </View>
          </Card>
        )}

        {activeTab === 'training' && (
          <Card style={styles.section}>
            <Text variant="h3">Active Training Plan</Text>
            {profile?.activePlan ? (
              <View style={styles.planContainer}>
                <Text variant="body">{profile.activePlan.name}</Text>
                <ProgressBar
                  progress={profile.activePlan.progress}
                  style={styles.progressBar}
                />
                <Text variant="body" color="textSecondary">
                  {profile.activePlan.weeksCompleted} of {profile.activePlan.totalWeeks} weeks completed
                </Text>
              </View>
            ) : (
              <Text variant="body" color="textSecondary">No active training plan</Text>
            )}
          </Card>
        )}

        {activeTab === 'achievements' && (
          <View style={styles.achievementsContainer}>
            {profile?.achievements?.map((achievement: Achievement) => (
              <Badge
                key={achievement.id}
                variant="primary"
                style={styles.achievementBadge}
              >
                {achievement.title}
              </Badge>
            ))}
          </View>
        )}
      </View>

      {/* Settings Button */}
      <Button
        variant="outline"
        onPress={() => navigation.navigate('Settings')}
        style={styles.settingsButton}
      >
        Settings
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: theme.spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    marginBottom: theme.spacing.xs,
  },
  tabs: {
    marginVertical: theme.spacing.md,
  },
  content: {
    padding: theme.spacing.lg,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  editButton: {
    padding: 0,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  pbContainer: {
    alignItems: 'flex-end',
  },
  planContainer: {
    marginTop: theme.spacing.md,
  },
  progressBar: {
    marginVertical: theme.spacing.sm,
  },
  achievementsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  achievementBadge: {
    width: '48%',
    marginBottom: theme.spacing.md,
  },
  settingsButton: {
    margin: theme.spacing.lg,
  },
});

export default ProfileScreen; 