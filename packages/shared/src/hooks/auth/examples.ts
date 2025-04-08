import { useAuth } from './useAuth';
import { useLogin } from './useLogin';
import { useRegister } from './useRegister';
import { useResetPassword } from './useResetPassword';
import { useUser } from './useUser';

/**
 * Examples demonstrating how to use the authentication hooks
 */

/**
 * Example of using the useAuth hook
 * 
 * This is the main authentication hook that provides the auth state and methods.
 */
export function authExample() {
  // Get auth methods and state
  const auth = useAuth();
  
  // Check if user is authenticated
  if (auth.isAuthenticated) {
    console.log('User is authenticated');
    console.log('User:', auth.user);
  } else {
    console.log('User is not authenticated');
  }
  
  // Example login
  async function handleLogin() {
    try {
      await auth.login('user@example.com', 'password123');
      
      if (auth.isAuthenticated) {
        console.log('Login successful');
      } else {
        console.log('Login failed:', auth.error);
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  }
  
  // Example logout
  async function handleLogout() {
    try {
      await auth.logout();
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
  
  return {
    auth,
    handleLogin,
    handleLogout,
  };
}

/**
 * Example of using the useLogin hook
 * 
 * This hook provides a more encapsulated way to handle login functionality.
 */
export function loginExample() {
  // Get login functionality
  const { state, login, reset } = useLogin();
  
  // Handle form submission
  async function handleSubmit(formData: { email: string; password: string }) {
    const success = await login(formData.email, formData.password);
    
    if (success) {
      console.log('Login successful');
      // Redirect or show success message
    } else {
      console.log('Login failed:', state.error);
      // Show error message
    }
  }
  
  // Reset form
  function handleReset() {
    reset();
    // Clear form fields
  }
  
  return {
    isLoading: state.isLoading,
    error: state.error,
    success: state.success,
    handleSubmit,
    handleReset,
  };
}

/**
 * Example of using the useRegister hook
 * 
 * This hook provides a more encapsulated way to handle registration functionality.
 */
export function registerExample() {
  // Get register functionality
  const { state, register, reset } = useRegister();
  
  // Handle form submission
  async function handleSubmit(formData: { 
    email: string;
    password: string;
    name: string;
  }) {
    const success = await register(formData);
    
    if (success) {
      console.log('Registration successful');
      // Redirect or show success message
    } else {
      console.log('Registration failed:', state.error);
      // Show error message
    }
  }
  
  // Reset form
  function handleReset() {
    reset();
    // Clear form fields
  }
  
  return {
    isLoading: state.isLoading,
    error: state.error,
    success: state.success,
    handleSubmit,
    handleReset,
  };
}

/**
 * Example of using the useResetPassword hook
 * 
 * This hook provides functionality for the password reset flow.
 */
export function resetPasswordExample() {
  // Get reset password functionality
  const { state, requestReset, completeReset, reset } = useResetPassword();
  
  // Request password reset
  async function handleRequestReset(email: string) {
    const success = await requestReset(email);
    
    if (success) {
      console.log('Password reset email sent');
      // Show success message
    } else {
      console.log('Failed to send reset email:', state.error);
      // Show error message
    }
  }
  
  // Complete password reset
  async function handleCompleteReset(token: string, newPassword: string) {
    const success = await completeReset(token, newPassword);
    
    if (success) {
      console.log('Password reset successful');
      // Redirect to login
    } else {
      console.log('Failed to reset password:', state.error);
      // Show error message
    }
  }
  
  return {
    isLoading: state.isLoading,
    error: state.error,
    success: state.success,
    emailSent: state.emailSent,
    handleRequestReset,
    handleCompleteReset,
    reset,
  };
}

/**
 * Example of using the useUser hook
 * 
 * This hook provides access to the current user information and methods to update it.
 */
export function userExample() {
  // Get user information and methods
  const { user, isAuthenticated, isLoading, updateUser } = useUser();
  
  // Update user profile
  async function handleUpdateProfile(formData: { 
    name: string;
    profilePicture?: string;
  }) {
    if (!isAuthenticated) {
      console.log('User is not authenticated');
      return;
    }
    
    const success = await updateUser({
      name: formData.name,
      profilePicture: formData.profilePicture,
    });
    
    if (success) {
      console.log('Profile updated successfully');
      // Show success message
    } else {
      console.log('Failed to update profile');
      // Show error message
    }
  }
  
  return {
    user,
    isAuthenticated,
    isLoading,
    handleUpdateProfile,
  };
} 