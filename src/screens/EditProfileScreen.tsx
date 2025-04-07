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

type EditProfileScreenNavigationProp = NativeStackNavigationProp<MainTabParamList, 'EditProfile'>;

interface FormData {
  name: string;
  dateOfBirth: string;
  gender: string;
}

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters'),
  dateOfBirth: Yup.string()
    .required('Date of birth is required'),
  gender: Yup.string()
    .required('Gender is required')
    .oneOf(['Male', 'Female', 'Other', 'PreferNotToSay'], 'Invalid gender'),
});

const EditProfileScreen = () => {
  const navigation = useNavigation<EditProfileScreenNavigationProp>();
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();
  const [error, setError] = React.useState<string>('');

  const handleSubmit = async (values: FormData, { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }) => {
    try {
      setError('');
      await updateProfile.mutateAsync({
        name: values.name,
        dateOfBirth: values.dateOfBirth,
        gender: values.gender,
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
        <Text variant="h1" style={styles.title}>Edit Profile</Text>
        <Text variant="body" color="textSecondary" style={styles.subtitle}>
          Update your personal information
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
            name: profile?.name || '',
            dateOfBirth: profile?.dateOfBirth || '',
            gender: profile?.gender || '',
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
            <>
              <Input
                label="Name"
                value={values.name}
                onChangeText={handleChange('name')}
                onBlur={handleBlur('name')}
                error={touched.name && errors.name ? errors.name : undefined}
                autoCapitalize="words"
                autoComplete="name"
                style={styles.input}
              />

              <Input
                label="Date of Birth"
                value={values.dateOfBirth}
                onChangeText={handleChange('dateOfBirth')}
                onBlur={handleBlur('dateOfBirth')}
                error={touched.dateOfBirth && errors.dateOfBirth ? errors.dateOfBirth : undefined}
                placeholder="YYYY-MM-DD"
                style={styles.input}
              />

              <Input
                label="Gender"
                value={values.gender}
                onChangeText={handleChange('gender')}
                onBlur={handleBlur('gender')}
                error={touched.gender && errors.gender ? errors.gender : undefined}
                placeholder="Male, Female, Other, PreferNotToSay"
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

export default EditProfileScreen; 