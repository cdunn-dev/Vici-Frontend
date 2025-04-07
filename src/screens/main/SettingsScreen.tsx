import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch } from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from '../../types/navigation';
import { useTheme } from '../../contexts/ThemeContext';

type Props = BottomTabScreenProps<MainTabParamList, 'Settings'>;

const SettingsScreen: React.FC<Props> = () => {
  const { theme, isDarkMode, toggleTheme } = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Settings</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Customize your app experience
        </Text>
      </View>

      <View style={styles.content}>
        <View style={[styles.settingItem, { borderBottomColor: theme.border }]}>
          <View>
            <Text style={[styles.settingTitle, { color: theme.text }]}>
              Dark Mode
            </Text>
            <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
              Toggle dark/light theme
            </Text>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: theme.switchTrack, true: theme.primary }}
            thumbColor={theme.switchThumb}
          />
        </View>

        {/* Add more settings here */}
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
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
  },
});

export default SettingsScreen; 