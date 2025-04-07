import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useDispatch } from 'react-redux';
import type { MainTabParamList } from '../../types/navigation';
import { useTheme } from '../../contexts/ThemeContext';

type Props = BottomTabScreenProps<MainTabParamList, 'Profile'>;

const ProfileScreen: React.FC<Props> = () => {
  const { theme } = useTheme();
  const dispatch = useDispatch();

  const handleLogout = () => {
    // TODO: Implement logout logic
    // dispatch(logout());
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Profile</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Your personal information
        </Text>
      </View>

      <View style={styles.content}>
        {/* Add profile content here */}
        <Text style={[styles.text, { color: theme.text }]}>
          Profile content coming soon...
        </Text>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.primary }]}
          onPress={handleLogout}
        >
          <Text style={[styles.buttonText, { color: theme.buttonText }]}>
            Logout
          </Text>
        </TouchableOpacity>
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
    marginBottom: 20,
  },
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen; 