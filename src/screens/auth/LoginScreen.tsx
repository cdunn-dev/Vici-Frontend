import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useDispatch } from 'react-redux';
import { Formik, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { useTheme } from '../../contexts/ThemeContext';
import { setUser, setToken } from '../../store/slices/authSlice';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../types/navigation';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { authService } from '../../services/auth';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

interface LoginFormValues {
  email: string;
  password: string;
  general?: string;
}

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please enter a valid email')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch();
  const { theme } = useTheme();

  const handleLogin = async (
    values: LoginFormValues,
    { setSubmitting, setFieldError }: FormikHelpers<LoginFormValues>
  ) => {
    try {
      const response = await authService.login(values);
      dispatch(setUser(response.user));
      dispatch(setToken(response.token));
    } catch (error) {
      if (error instanceof Error) {
        setFieldError('general', error.message);
      } else {
        setFieldError('general', 'An unexpected error occurred');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Welcome Back</Text>
      
      <Formik<LoginFormValues>
        initialValues={{ email: '', password: '' }}
        validationSchema={validationSchema}
        onSubmit={handleLogin}
      >
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          errors,
          touched,
          isSubmitting,
        }) => (
          <>
            <Input
              label="Email"
              value={values.email}
              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
              error={errors.email}
              touched={touched.email}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="Enter your email"
            />

            <Input
              label="Password"
              value={values.password}
              onChangeText={handleChange('password')}
              onBlur={handleBlur('password')}
              error={errors.password}
              touched={touched.password}
              secureTextEntry
              placeholder="Enter your password"
            />

            {errors.general && (
              <Text style={[styles.errorText, { color: theme.error }]}>
                {errors.general}
              </Text>
            )}

            <Button
              title="Login"
              onPress={() => handleSubmit()}
              loading={isSubmitting}
              style={styles.loginButton}
            />
          </>
        )}
      </Formik>

      <Button
        title="Don't have an account? Register"
        onPress={() => navigation.navigate('Register')}
        variant="outline"
        style={styles.registerButton}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  loginButton: {
    marginTop: 24,
  },
  registerButton: {
    marginTop: 16,
  },
});

export default LoginScreen; 