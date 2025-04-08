import { useState } from 'react';
import { useAuth } from './useAuth';

interface RegisterState {
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
}

interface UseRegisterReturn {
  /**
   * Current registration process state
   */
  state: RegisterState;
  
  /**
   * Register function that accepts user data
   */
  register: (data: RegisterData) => Promise<boolean>;
  
  /**
   * Reset the registration state
   */
  reset: () => void;
}

/**
 * A hook for handling user registration
 * 
 * @returns Registration state and functions
 */
export function useRegister(): UseRegisterReturn {
  const auth = useAuth();
  const [state, setState] = useState<RegisterState>({
    isLoading: false,
    error: null,
    success: false,
  });

  /**
   * Register function
   */
  const register = async (data: RegisterData): Promise<boolean> => {
    try {
      // Validate inputs
      if (!data.email || !data.password || !data.name) {
        setState({
          isLoading: false,
          error: 'All fields are required',
          success: false,
        });
        return false;
      }

      // Start loading
      setState({
        isLoading: true,
        error: null,
        success: false,
      });

      // Call auth register
      await auth.register(data.email, data.password, data.name);

      // Check if registration was successful
      if (auth.isAuthenticated && !auth.error) {
        setState({
          isLoading: false,
          error: null,
          success: true,
        });
        return true;
      } else {
        setState({
          isLoading: false,
          error: auth.error || 'Registration failed',
          success: false,
        });
        return false;
      }
    } catch (error) {
      // Handle any errors
      setState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'An error occurred',
        success: false,
      });
      return false;
    }
  };

  /**
   * Reset registration state
   */
  const reset = () => {
    setState({
      isLoading: false,
      error: null,
      success: false,
    });
  };

  return {
    state,
    register,
    reset,
  };
} 