import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Layout from '../components/Layout';
import Button from '../components/Button';
import { theme } from '../utils/theme';
import { RootStackParamList } from '../navigation/AppNavigator';

type OnboardingScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Onboarding'
>;

const OnboardingScreen = () => {
  const navigation = useNavigation<OnboardingScreenNavigationProp>();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [fitnessLevel, setFitnessLevel] = useState('');

  const handleSubmit = () => {
    // In a real app, you would save this data to your backend
    console.log('User info:', { name, email, fitnessLevel });
    // Navigate to the workout screen
    navigation.navigate('Workout');
  };

  return (
    <Layout>
      <View style={styles.container}>
        <Text style={[styles.title, theme.typography.h2]}>
          Welcome to Vici
        </Text>
        <Text style={[styles.subtitle, theme.typography.body]}>
          Let's get to know you better
        </Text>

        <View style={styles.form}>
          <Text style={[styles.label, theme.typography.body]}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            placeholderTextColor={theme.colors.textSecondary}
          />

          <Text style={[styles.label, theme.typography.body]}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            placeholderTextColor={theme.colors.textSecondary}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={[styles.label, theme.typography.body]}>Fitness Level</Text>
          <TextInput
            style={styles.input}
            value={fitnessLevel}
            onChangeText={setFitnessLevel}
            placeholder="Beginner, Intermediate, Advanced"
            placeholderTextColor={theme.colors.textSecondary}
          />

          <Button
            title="Continue"
            onPress={handleSubmit}
            variant="primary"
            style={styles.button}
          />
        </View>
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    marginBottom: theme.spacing.xl,
    color: theme.colors.textSecondary,
  },
  form: {
    width: '100%',
  },
  label: {
    marginBottom: theme.spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
    color: theme.colors.text,
    backgroundColor: theme.colors.background,
  },
  button: {
    marginTop: theme.spacing.md,
  },
});

export default OnboardingScreen; 