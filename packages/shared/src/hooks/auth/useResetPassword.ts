import { useState } from 'react';
import { useAuth } from './useAuth';

interface ResetPasswordState {
  isLoading: boolean;
  error: string | null;
  success: boolean;
  emailSent: boolean;
}

interface UseResetPasswordReturn {
  /**
   * Current password reset process state
   */
  state: ResetPasswordState;
  
  /**
   * Request password reset function that sends a reset email
   */
  requestReset: (email: string) => Promise<boolean>;
  
  /**
   * Complete password reset with a token and new password
   */
  completeReset: (token: string, newPassword: string) => Promise<boolean>;
  
  /**
   * Reset the password reset state
   */
  reset: () => void;
}

/**
 * A hook for handling password reset functionality
 * 
 * @returns Password reset state and functions
 */
export function useResetPassword(): UseResetPasswordReturn {
  const auth = useAuth();
  const [state, setState] = useState<ResetPasswordState>({
    isLoading: false,
    error: null,
    success: false,
    emailSent: false,
  });

  /**
   * Request password reset (send email)
   */
  const requestReset = async (email: string): Promise<boolean> => {
    try {
      // Validate inputs
      if (!email) {
        setState(prev => ({
          ...prev,
          error: 'Email is required',
        }));
        return false;
      }

      // Start loading
      setState(prev => ({
        ...prev,
        isLoading: true,
        error: null,
      }));

      // Call auth resetPassword
      await auth.resetPassword(email);

      // Success - Email sent
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: null,
        emailSent: true,
      }));
      return true;
    } catch (error) {
      // Handle any errors
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      }));
      return false;
    }
  };

  /**
   * Complete password reset with token and new password
   */
  const completeReset = async (token: string, newPassword: string): Promise<boolean> => {
    try {
      // Validate inputs
      if (!token || !newPassword) {
        setState(prev => ({
          ...prev,
          error: 'Token and new password are required',
        }));
        return false;
      }

      // Start loading
      setState(prev => ({
        ...prev,
        isLoading: true,
        error: null,
      }));

      // Here you would make an API call to complete the password reset
      // For now, we'll just mock this functionality
      const response = await fetch('https://api.example.com/auth/reset-password/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to reset password');
      }

      // Success
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: null,
        success: true,
      }));
      return true;
    } catch (error) {
      // Handle any errors
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      }));
      return false;
    }
  };

  /**
   * Reset password reset state
   */
  const reset = () => {
    setState({
      isLoading: false,
      error: null,
      success: false,
      emailSent: false,
    });
  };

  return {
    state,
    requestReset,
    completeReset,
    reset,
  };
} 