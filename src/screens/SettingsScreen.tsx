import React from 'react';
import { View, StyleSheet, ScrollView, Switch, ViewStyle } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainTabParamList } from '../navigation/types';
import { theme } from '../utils/theme';
import Text from '../components/Text';
import Button from '../components/Button';
import Divider from '../components/Divider';
import { useAuth } from '../hooks/useAuth';

type SettingsScreenNavigationProp = NativeStackNavigationProp<MainTabParamList, 'Settings'>;

const SettingsScreen = () => {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const { logout } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(false);
  const [metricUnits, setMetricUnits] = React.useState(true);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text variant="h1" style={styles.title}>Settings</Text>

        <View style={styles.section}>
          <Text variant="h2" style={styles.sectionTitle}>Preferences</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLabel}>
              <Text variant="body">Enable Notifications</Text>
              <Text variant="caption" color="textSecondary">Receive updates about your training</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={theme.colors.background}
            />
          </View>

          <Divider style={styles.divider} />

          <View style={styles.settingItem}>
            <View style={styles.settingLabel}>
              <Text variant="body">Dark Mode</Text>
              <Text variant="caption" color="textSecondary">Use dark theme</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={theme.colors.background}
            />
          </View>

          <Divider style={styles.divider} />

          <View style={styles.settingItem}>
            <View style={styles.settingLabel}>
              <Text variant="body">Metric Units</Text>
              <Text variant="caption" color="textSecondary">Use kilometers and kilograms</Text>
            </View>
            <Switch
              value={metricUnits}
              onValueChange={setMetricUnits}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={theme.colors.background}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text variant="h2" style={styles.sectionTitle}>Account</Text>
          
          <Button
            variant="outline"
            onPress={() => navigation.navigate('EditProfile')}
            style={styles.button}
          >
            Edit Profile
          </Button>

          <Button
            variant="outline"
            onPress={() => navigation.navigate('EditRunnerProfile')}
            style={styles.button}
          >
            Edit Runner Profile
          </Button>

          <Button
            variant="outline"
            onPress={() => {/* TODO: Implement change password */}}
            style={styles.button}
          >
            Change Password
          </Button>
        </View>

        <View style={styles.section}>
          <Text variant="h2" style={styles.sectionTitle}>Support</Text>
          
          <Button
            variant="outline"
            onPress={() => {/* TODO: Implement help center */}}
            style={styles.button}
          >
            Help Center
          </Button>

          <Button
            variant="outline"
            onPress={() => {/* TODO: Implement contact support */}}
            style={styles.button}
          >
            Contact Support
          </Button>

          <Button
            variant="outline"
            onPress={() => {/* TODO: Implement privacy policy */}}
            style={styles.button}
          >
            Privacy Policy
          </Button>

          <Button
            variant="outline"
            onPress={() => {/* TODO: Implement terms of service */}}
            style={styles.button}
          >
            Terms of Service
          </Button>
        </View>

        <Button
          variant="outline"
          onPress={handleLogout}
          style={StyleSheet.flatten([styles.logoutButton, { borderColor: theme.colors.error }])}
        >
          Log Out
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
  },
  title: {
    marginBottom: theme.spacing.lg,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    marginBottom: theme.spacing.md,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  settingLabel: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  divider: {
    marginVertical: theme.spacing.sm,
  },
  button: {
    marginBottom: theme.spacing.sm,
  },
  logoutButton: {
    marginTop: theme.spacing.xl,
  },
});

export default SettingsScreen; 