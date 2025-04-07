import React from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { MainTabParamList } from '../navigation/types';
import { useProfile, useUpdateProfile } from '../services/api/user';
import { theme } from '../utils/theme';
import Text from '../components/Text';
import Input from '../components/Input';
import Button from '../components/Button';
import Alert from '../components/Alert';

type EditRunnerProfileScreenNavigationProp = NativeStackNavigationProp<MainTabParamList, 'EditRunnerProfile'>;

interface FormData {
  height: string;
  weight: string;
  experienceLevel: string;
  weeklyMileage: string;
  targetRace: string;
  targetRaceDate: string;
}

const validationSchema = Yup.object().shape({
  height: Yup.string()
    .required('Height is required')
    .matches(/^\d+$/, 'Height must be a number'),
  weight: Yup.string()
    .required('Weight is required')
    .matches(/^\d+$/, 'Weight must be a number'),
  experienceLevel: Yup.string()
    .required('Experience level is required')
    .oneOf(['Beginner', 'Intermediate', 'Advanced', 'Elite'], 'Invalid experience level'),
  weeklyMileage: Yup.string()
    .required('Weekly mileage is required')
    .matches(/^\d+$/, 'Weekly mileage must be a number'),
  targetRace: Yup.string()
    .required('Target race is required'),
  targetRaceDate: Yup.string()
    .required('Target race date is required'),
});

const EditRunnerProfileScreen = () => {
  const navigation = useNavigation<EditRunnerProfileScreenNavigationProp>();
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();
  const [error, setError] = React.useState<string>('');

  const handleSubmit = async (values: FormData, { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }) => {
    try {
      setError('');
      await updateProfile.mutateAsync({
        height: parseInt(values.height),
        weight: parseInt(values.weight),
        experienceLevel: values.experienceLevel,
        weeklyMileage: parseInt(values.weeklyMileage),
        targetRace: values.targetRace,
        targetRaceDate: values.targetRaceDate,
      });
      navigation.goBack();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while updating profile');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="h1" style={styles.title}>Edit Runner Profile</Text>
        <Text variant="body" color="textSecondary" style={styles.subtitle}>
          Update your running information
        </Text>

        {error && (
          <Alert
            type="error"
            title="Error"
            message={error}
            style={styles.alert}
          />
        )}

        <Formik
          initialValues={{
            height: profile?.height?.toString() || '',
            weight: profile?.weight?.toString() || '',
            experienceLevel: profile?.experienceLevel || '',
            weeklyMileage: profile?.weeklyMileage?.toString() || '',
            targetRace: profile?.targetRace || '',
            targetRaceDate: profile?.targetRaceDate || '',
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
            <>
              <Input
                label="Height (cm)"
                value={values.height}
                onChangeText={handleChange('height')}
                onBlur={handleBlur('height')}
                error={touched.height && errors.height ? errors.height : undefined}
                keyboardType="numeric"
                style={styles.input}
              />

              <Input
                label="Weight (kg)"
                value={values.weight}
                onChangeText={handleChange('weight')}
                onBlur={handleBlur('weight')}
                error={touched.weight && errors.weight ? errors.weight : undefined}
                keyboardType="numeric"
                style={styles.input}
              />

              <Input
                label="Experience Level"
                value={values.experienceLevel}
                onChangeText={handleChange('experienceLevel')}
                onBlur={handleBlur('experienceLevel')}
                error={touched.experienceLevel && errors.experienceLevel ? errors.experienceLevel : undefined}
                placeholder="Beginner, Intermediate, Advanced, Elite"
                style={styles.input}
              />

              <Input
                label="Weekly Mileage (km)"
                value={values.weeklyMileage}
                onChangeText={handleChange('weeklyMileage')}
                onBlur={handleBlur('weeklyMileage')}
                error={touched.weeklyMileage && errors.weeklyMileage ? errors.weeklyMileage : undefined}
                keyboardType="numeric"
                style={styles.input}
              />

              <Input
                label="Target Race"
                value={values.targetRace}
                onChangeText={handleChange('targetRace')}
                onBlur={handleBlur('targetRace')}
                error={touched.targetRace && errors.targetRace ? errors.targetRace : undefined}
                style={styles.input}
              />

              <Input
                label="Target Race Date"
                value={values.targetRaceDate}
                onChangeText={handleChange('targetRaceDate')}
                onBlur={handleBlur('targetRaceDate')}
                error={touched.targetRaceDate && errors.targetRaceDate ? errors.targetRaceDate : undefined}
                placeholder="YYYY-MM-DD"
                style={styles.input}
              />

              <Button
                onPress={() => handleSubmit()}
                loading={isSubmitting}
                style={styles.button}
              >
                Save Changes
              </Button>

              <Button
                variant="outline"
                onPress={() => navigation.goBack()}
                style={styles.secondaryButton}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </>
          )}
        </Formik>
      </ScrollView>
    </KeyboardAvoidingView>
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
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    marginBottom: theme.spacing.lg,
  },
  alert: {
    marginBottom: theme.spacing.lg,
  },
  input: {
    marginBottom: theme.spacing.md,
  },
  button: {
    marginTop: theme.spacing.md,
  },
  secondaryButton: {
    marginTop: theme.spacing.sm,
  },
});

export default EditRunnerProfileScreen; 