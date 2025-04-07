import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { theme } from '../utils/theme';
import { useAuth } from '../hooks/useAuth';
import { AuthStackParamList } from '../navigation/types';
import Text from '../components/Text';
import Input from '../components/Input';
import Button from '../components/Button';
import Alert from '../components/Alert';

interface FormData {
  email: string;
  password: string;
}

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
});

type LoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

const LoginScreen = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { login } = useAuth();
  const [error, setError] = useState<string>('');

  const handleLogin = async (values: FormData, { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }) => {
    try {
      setError('');
      await login(values.email, values.password);
      // Navigation will be handled by the auth state change
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during login');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text variant="h1" style={styles.title}>Welcome Back</Text>
        <Text variant="body" color="textSecondary" style={styles.subtitle}>
          Sign in to continue your training journey
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
          initialValues={{ email: '', password: '' }}
          validationSchema={validationSchema}
          onSubmit={handleLogin}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
            <>
              <Input
                label="Email"
                value={values.email}
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                error={touched.email && errors.email ? errors.email : undefined}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                style={styles.input}
              />

              <Input
                label="Password"
                value={values.password}
                onChangeText={handleChange('password')}
                onBlur={handleBlur('password')}
                error={touched.password && errors.password ? errors.password : undefined}
                secureTextEntry
                autoComplete="password"
                style={styles.input}
              />

              <Button
                onPress={() => handleSubmit()}
                loading={isSubmitting}
                style={styles.button}
              >
                Sign In
              </Button>

              <Button
                variant="outline"
                onPress={() => navigation.navigate('Register')}
                style={styles.secondaryButton}
                disabled={isSubmitting}
              >
                Create an Account
              </Button>

              <Button
                variant="text"
                onPress={() => navigation.navigate('ForgotPassword')}
                style={styles.textButton}
                disabled={isSubmitting}
              >
                Forgot Password?
              </Button>
            </>
          )}
        </Formik>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
    justifyContent: 'center',
  },
  title: {
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
  },
  alert: {
    marginBottom: theme.spacing.lg,
  },
  input: {
    marginBottom: theme.spacing.md,
  },
  button: {
    marginTop: theme.spacing.lg,
  },
  secondaryButton: {
    marginTop: theme.spacing.md,
  },
  textButton: {
    marginTop: theme.spacing.sm,
  },
});

export default LoginScreen; 