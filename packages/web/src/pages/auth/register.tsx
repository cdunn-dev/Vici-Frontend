import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { 
  Box, 
  Button, 
  Card,
  Container, 
  Flex, 
  FormControl, 
  FormLabel, 
  Heading, 
  Input, 
  Text, 
  VStack 
} from '@vici/shared/components';
import { useRegister } from '@vici/shared/hooks/auth';
import { useForm, validators } from '@vici/shared/hooks/form';

const RegisterPage = () => {
  const router = useRouter();
  const { register, isLoading, error } = useRegister();
  const [success, setSuccess] = useState(false);
  
  const form = useForm({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validators: {
      name: [validators.required('Name is required')],
      email: [validators.required('Email is required'), validators.email('Please enter a valid email')],
      password: [
        validators.required('Password is required'),
        validators.minLength(8, 'Password must be at least 8 characters'),
        validators.passwordStrength('Password must include uppercase, lowercase, number, and special character'),
      ],
      confirmPassword: [
        validators.required('Please confirm your password'),
        validators.matches('password', 'Passwords do not match'),
      ],
    },
    onSubmit: async (values) => {
      try {
        await register({
          name: values.name,
          email: values.email,
          password: values.password,
        });
        setSuccess(true);
      } catch (err) {
        // Error is handled by the useRegister hook
      }
    },
  });

  if (success) {
    return (
      <Flex 
        direction="column" 
        align="center" 
        justify="center" 
        minHeight="100vh"
        bg="gray.50"
      >
        <Container maxW="md" p={0}>
          <Card p={8}>
            <VStack spacing={6} align="stretch">
              <Box textAlign="center">
                <Heading as="h1" size="xl" mb={2} color="green.500">
                  Registration Successful!
                </Heading>
                <Text>
                  Your account has been created. You can now sign in.
                </Text>
              </Box>
              
              <Button 
                variant="primary" 
                width="full" 
                onClick={() => router.push('/auth/login')}
              >
                Sign In
              </Button>
            </VStack>
          </Card>
        </Container>
      </Flex>
    );
  }

  return (
    <Flex 
      direction="column" 
      align="center" 
      justify="center" 
      minHeight="100vh"
      bg="gray.50"
    >
      <Container maxW="md" p={0}>
        <Card p={8}>
          <VStack spacing={6} align="stretch">
            <Box textAlign="center">
              <Heading as="h1" size="xl" mb={2}>
                Create an Account
              </Heading>
              <Text color="gray.600">
                Join Vici to start your training journey
              </Text>
            </Box>

            {error && (
              <Box bg="red.50" p={3} borderRadius="md" color="red.600">
                {error}
              </Box>
            )}

            <form onSubmit={form.handleSubmit}>
              <VStack spacing={4} align="stretch">
                <FormControl isInvalid={!!form.fields.name.touched && form.fields.name.errors.length > 0}>
                  <FormLabel htmlFor="name">Name</FormLabel>
                  <Input
                    id="name"
                    placeholder="Enter your name"
                    {...form.fields.name.getInputProps()}
                  />
                  {form.fields.name.touched && form.fields.name.errors.length > 0 && (
                    <Text color="red.500" fontSize="sm">
                      {form.fields.name.errors[0]}
                    </Text>
                  )}
                </FormControl>

                <FormControl isInvalid={!!form.fields.email.touched && form.fields.email.errors.length > 0}>
                  <FormLabel htmlFor="email">Email</FormLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    {...form.fields.email.getInputProps()}
                  />
                  {form.fields.email.touched && form.fields.email.errors.length > 0 && (
                    <Text color="red.500" fontSize="sm">
                      {form.fields.email.errors[0]}
                    </Text>
                  )}
                </FormControl>

                <FormControl isInvalid={!!form.fields.password.touched && form.fields.password.errors.length > 0}>
                  <FormLabel htmlFor="password">Password</FormLabel>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a password"
                    {...form.fields.password.getInputProps()}
                  />
                  {form.fields.password.touched && form.fields.password.errors.length > 0 && (
                    <Text color="red.500" fontSize="sm">
                      {form.fields.password.errors[0]}
                    </Text>
                  )}
                </FormControl>

                <FormControl isInvalid={!!form.fields.confirmPassword.touched && form.fields.confirmPassword.errors.length > 0}>
                  <FormLabel htmlFor="confirmPassword">Confirm Password</FormLabel>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    {...form.fields.confirmPassword.getInputProps()}
                  />
                  {form.fields.confirmPassword.touched && form.fields.confirmPassword.errors.length > 0 && (
                    <Text color="red.500" fontSize="sm">
                      {form.fields.confirmPassword.errors[0]}
                    </Text>
                  )}
                </FormControl>

                <Button 
                  type="submit" 
                  variant="primary" 
                  width="full" 
                  isLoading={isLoading}
                  isDisabled={!form.isValid}
                >
                  Create Account
                </Button>
              </VStack>
            </form>

            <Box textAlign="center">
              <Text>
                Already have an account?{' '}
                <Link href="/auth/login" passHref>
                  <Text as="a" color="primary.500">
                    Sign in
                  </Text>
                </Link>
              </Text>
            </Box>
          </VStack>
        </Card>
      </Container>
    </Flex>
  );
};

export default RegisterPage; 