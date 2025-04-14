import { useState } from 'react';
import { useAuth } from './useAuth';

interface LoginState {
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

interface UseLoginReturn {
  /**
   * Current login process state
   */
  state: LoginState;
  
  /**
   * Login function that accepts email and password
   */
  login: (email: string, password: string) => Promise<boolean>;
  
  /**
   * Reset the login state
   */
  reset: () => void;
}

/**
 * A hook for handling login functionality
 * 
 * @returns Login state and functions
 */
export function useLogin(): UseLoginReturn {
  const auth = useAuth();
  const [state, setState] = useState<LoginState>({
    isLoading: false,
    error: null,
    success: false,
  });

  /**
   * Login function
   */
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Validate inputs
      if (!email || !password) {
        setState({
          isLoading: false,
          error: 'Email and password are required',
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

      // Call auth login
      await auth.login(email, password);

      // Check if login was successful
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
          error: auth.error || 'Login failed',
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
   * Reset login state
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
    login,
    reset,
  };
} 