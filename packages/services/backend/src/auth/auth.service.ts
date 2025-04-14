import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { prisma, UserCreateInput } from '@vici/database';

/**
 * Authentication service
 */
export class AuthService {
  private readonly JWT_SECRET: string;
  private readonly JWT_REFRESH_SECRET: string;
  private readonly JWT_EXPIRES_IN_SECONDS: number;
  private readonly JWT_REFRESH_EXPIRES_IN_SECONDS: number;

  constructor() {
    // Load from environment variables
    this.JWT_SECRET = process.env.JWT_SECRET || 'vici-jwt-secret';
    this.JWT_REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || 'vici-refresh-secret';
    
    // Parse expiry times (expect strings like "3600" or "604800" in env)
    this.JWT_EXPIRES_IN_SECONDS = parseInt(process.env.JWT_EXPIRES_IN_SECONDS || '3600', 10); // Default 1 hour (3600s)
    this.JWT_REFRESH_EXPIRES_IN_SECONDS = parseInt(process.env.JWT_REFRESH_EXPIRES_IN_SECONDS || '604800', 10); // Default 7 days (604800s)

    if (!this.JWT_SECRET || !this.JWT_REFRESH_SECRET) {
      console.error('FATAL: JWT secrets not configured!');
    }
    if (isNaN(this.JWT_EXPIRES_IN_SECONDS) || isNaN(this.JWT_REFRESH_EXPIRES_IN_SECONDS)) {
       console.error('FATAL: JWT expiry times in env vars must be valid numbers in seconds!'); 
       // Set safe defaults if parsing failed to avoid NaN issues
       this.JWT_EXPIRES_IN_SECONDS = 3600;
       this.JWT_REFRESH_EXPIRES_IN_SECONDS = 604800;
    }
  }

  /**
   * Register a new user
   * @param data User registration data
   * @returns User and token information
   */
  async register(data: UserCreateInput) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email: data.email
      }
    });

    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        ...data,
        passwordHash: hashedPassword
      }
    });

    // Generate tokens
    const { accessToken, refreshToken } = this.generateTokens(user.id);

    // Return user and tokens
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      accessToken,
      refreshToken
    };
  }

  /**
   * Login a user
   * @param email User email
   * @param password User password
   * @returns User and token information
   */
  async login(email: string, password: string) {
    // Find user
    const user = await prisma.user.findUnique({
      where: {
        email
      }
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate tokens
    const { accessToken, refreshToken } = this.generateTokens(user.id);

    // Return user and tokens
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      accessToken,
      refreshToken
    };
  }

  /**
   * Refresh access token
   * @param refreshToken Refresh token
   * @returns New access token and refresh token
   */
  async refreshToken(refreshToken: string) {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, this.JWT_REFRESH_SECRET) as { id: string };

      // Find user
      const user = await prisma.user.findUnique({
        where: {
          id: decoded.id
        }
      });

      if (!user) {
        throw new Error('Invalid token');
      }

      // Generate new tokens
      const tokens = this.generateTokens(user.id);

      // Return new tokens
      return tokens;
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  /**
   * Forgot password
   * @param email User email
   */
  async forgotPassword(email: string) {
    // Find user
    const user = await prisma.user.findUnique({
      where: {
        email
      }
    });

    if (!user) {
      // For security, don't reveal if user exists
      return;
    }

    // Generate password reset token
    const token = jwt.sign(
      { id: user.id },
      this.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // In a real implementation, send email with reset link
    console.log(`Reset token for ${email}: ${token}`);

    // Return silently
    return;
  }

  /**
   * Reset password
   * @param token Reset token
   * @param password New password
   */
  async resetPassword(token: string, password: string) {
    try {
      // Verify token
      const decoded = jwt.verify(token, this.JWT_SECRET) as { id: string };

      // Hash new password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Update user password
      await prisma.user.update({
        where: {
          id: decoded.id
        },
        data: {
          passwordHash: hashedPassword
        }
      });

      // Return silently
      return;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Logout user
   * @param refreshToken Refresh token
   */
  async logout(refreshToken: string) {
    // In a real implementation, add token to blacklist
    // or remove from database
    return;
  }

  /**
   * Generate JWT tokens
   * @param userId User ID
   * @returns Access and refresh tokens
   */
  private generateTokens(userId: string) {
    // Generate access token
    const accessTokenOptions: jwt.SignOptions = { expiresIn: this.JWT_EXPIRES_IN_SECONDS };
    const accessToken = jwt.sign(
      { id: userId },
      this.JWT_SECRET,
      accessTokenOptions
    );

    // Generate refresh token
    const refreshTokenOptions: jwt.SignOptions = { expiresIn: this.JWT_REFRESH_EXPIRES_IN_SECONDS };
    const refreshToken = jwt.sign(
      { id: userId },
      this.JWT_REFRESH_SECRET,
      refreshTokenOptions
    );

    return { accessToken, refreshToken };
  }
} 