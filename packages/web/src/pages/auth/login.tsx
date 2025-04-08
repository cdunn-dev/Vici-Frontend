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
import { useLogin } from '@vici/shared/hooks/auth';
import { useForm, validators } from '@vici/shared/hooks/form';

const LoginPage = () => {
  const router = useRouter();
  const { login, isLoading, error } = useLogin();
  
  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },
    validators: {
      email: [validators.required('Email is required'), validators.email('Please enter a valid email')],
      password: [validators.required('Password is required')],
    },
    onSubmit: async (values) => {
      try {
        await login(values.email, values.password);
        router.push('/');
      } catch (err) {
        // Error is handled by the useLogin hook
      }
    },
  });

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
                Welcome Back
              </Heading>
              <Text color="gray.600">
                Sign in to continue to Vici
              </Text>
            </Box>

            {error && (
              <Box bg="red.50" p={3} borderRadius="md" color="red.600">
                {error}
              </Box>
            )}

            <form onSubmit={form.handleSubmit}>
              <VStack spacing={4} align="stretch">
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
                    placeholder="Enter your password"
                    {...form.fields.password.getInputProps()}
                  />
                  {form.fields.password.touched && form.fields.password.errors.length > 0 && (
                    <Text color="red.500" fontSize="sm">
                      {form.fields.password.errors[0]}
                    </Text>
                  )}
                </FormControl>

                <Box textAlign="right">
                  <Link href="/auth/forgot-password" passHref>
                    <Text as="a" color="primary.500" fontSize="sm">
                      Forgot Password?
                    </Text>
                  </Link>
                </Box>

                <Button 
                  type="submit" 
                  variant="primary" 
                  width="full" 
                  isLoading={isLoading}
                  isDisabled={!form.isValid}
                >
                  Sign In
                </Button>
              </VStack>
            </form>

            <Box textAlign="center">
              <Text>
                Don't have an account?{' '}
                <Link href="/auth/register" passHref>
                  <Text as="a" color="primary.500">
                    Sign up
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

export default LoginPage; 