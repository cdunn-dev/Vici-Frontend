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

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  general?: string;
}

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .required('Name is required'),
  email: Yup.string()
    .email('Please enter a valid email')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
});

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch();
  const { theme } = useTheme();

  const handleRegister = async (
    values: RegisterFormValues,
    { setSubmitting, setFieldError }: FormikHelpers<RegisterFormValues>
  ) => {
    try {
      const { confirmPassword, ...registerData } = values;
      const response = await authService.register(registerData);
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
      <Text style={[styles.title, { color: theme.text }]}>Create Account</Text>
      
      <Formik<RegisterFormValues>
        initialValues={{
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
        }}
        validationSchema={validationSchema}
        onSubmit={handleRegister}
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
              label="Name"
              value={values.name}
              onChangeText={handleChange('name')}
              onBlur={handleBlur('name')}
              error={errors.name}
              touched={touched.name}
              placeholder="Enter your name"
            />

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
              placeholder="Create a password"
            />

            <Input
              label="Confirm Password"
              value={values.confirmPassword}
              onChangeText={handleChange('confirmPassword')}
              onBlur={handleBlur('confirmPassword')}
              error={errors.confirmPassword}
              touched={touched.confirmPassword}
              secureTextEntry
              placeholder="Confirm your password"
            />

            {errors.general && (
              <Text style={[styles.errorText, { color: theme.error }]}>
                {errors.general}
              </Text>
            )}

            <Button
              title="Register"
              onPress={() => handleSubmit()}
              loading={isSubmitting}
              style={styles.registerButton}
            />
          </>
        )}
      </Formik>

      <Button
        title="Already have an account? Login"
        onPress={() => navigation.navigate('Login')}
        variant="outline"
        style={styles.loginButton}
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
  registerButton: {
    marginTop: 24,
  },
  loginButton: {
    marginTop: 16,
  },
});

export default RegisterScreen; 