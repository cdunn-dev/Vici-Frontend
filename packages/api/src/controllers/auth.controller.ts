import { Request, Response } from 'express';
import { AuthService } from '@vici/services';

/**
 * Authentication controller
 */
export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * Login user
   */
  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;
      const result = await this.authService.login(email, password);
      
      res.json(result);
    } catch (error: any) {
      res.status(401).json({
        error: true,
        message: error.message || 'Authentication failed'
      });
    }
  };

  /**
   * Register user
   */
  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.authService.register(req.body);
      
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({
        error: true,
        message: error.message || 'Registration failed'
      });
    }
  };

  /**
   * Refresh authentication token
   */
  refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const { refreshToken } = req.body;
      const result = await this.authService.refreshToken(refreshToken);
      
      res.json(result);
    } catch (error: any) {
      res.status(401).json({
        error: true,
        message: error.message || 'Token refresh failed'
      });
    }
  };

  /**
   * Forgot password
   */
  forgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;
      await this.authService.forgotPassword(email);
      
      res.json({
        message: 'Password reset instructions sent to your email'
      });
    } catch (error: any) {
      res.status(400).json({
        error: true,
        message: error.message || 'Forgot password request failed'
      });
    }
  };

  /**
   * Reset password
   */
  resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token, password } = req.body;
      await this.authService.resetPassword(token, password);
      
      res.json({
        message: 'Password reset successful'
      });
    } catch (error: any) {
      res.status(400).json({
        error: true,
        message: error.message || 'Password reset failed'
      });
    }
  };

  /**
   * Logout user
   */
  logout = async (req: Request, res: Response): Promise<void> => {
    try {
      const { refreshToken } = req.body;
      await this.authService.logout(refreshToken);
      
      res.json({
        message: 'Logout successful'
      });
    } catch (error: any) {
      res.status(400).json({
        error: true,
        message: error.message || 'Logout failed'
      });
    }
  };
} 