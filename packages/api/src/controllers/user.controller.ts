import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * Controller for user-related operations
 */
export class UserController {
  /**
   * Get current user profile
   */
  public getCurrentUser = async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      
      // Get user with settings but without password
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          settings: {
            include: {
              notificationPreferences: true
            }
          }
        }
      });
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      return res.status(200).json({
        success: true,
        data: userWithoutPassword
      });
    } catch (error) {
      console.error('Error getting user profile:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  };
  
  /**
   * Update user profile information
   */
  public updateProfile = async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const { name, email, dateOfBirth, gender, profilePicture } = req.body;
      
      // Check if email is already in use by another user
      if (email) {
        const existingUser = await prisma.user.findUnique({
          where: { email }
        });
        
        if (existingUser && existingUser.id !== userId) {
          return res.status(400).json({
            success: false,
            message: 'Email is already in use'
          });
        }
      }
      
      // Update user profile
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          name,
          email,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
          gender,
          profilePicture
        },
        select: {
          id: true,
          email: true,
          name: true,
          dateOfBirth: true,
          gender: true,
          profilePicture: true
        }
      });
      
      return res.status(200).json({
        success: true,
        data: updatedUser,
        message: 'Profile updated successfully'
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  };
  
  /**
   * Update user settings
   */
  public updateSettings = async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const { 
        distanceUnit, 
        language, 
        coachingStyle, 
        privacyDataSharing, 
        notificationPreferences 
      } = req.body;
      
      // Get user settings
      const userSettings = await prisma.userSettings.findFirst({
        where: { userId }
      });
      
      if (!userSettings) {
        return res.status(404).json({
          success: false,
          message: 'User settings not found'
        });
      }
      
      // Update user settings
      const updatedSettings = await prisma.userSettings.update({
        where: { id: userSettings.id },
        data: {
          distanceUnit,
          language,
          coachingStyle,
          privacyDataSharing,
          notificationPreferences: notificationPreferences 
            ? {
                update: notificationPreferences
              }
            : undefined
        },
        include: {
          notificationPreferences: true
        }
      });
      
      return res.status(200).json({
        success: true,
        data: updatedSettings,
        message: 'Settings updated successfully'
      });
    } catch (error) {
      console.error('Error updating user settings:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  };
  
  /**
   * Update user password
   */
  public updatePassword = async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;
      
      // Validate input
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password and new password are required'
        });
      }
      
      if (newPassword.length < 8) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 8 characters long'
        });
      }
      
      // Get user with password
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      // Check if current password is correct
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }
      
      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Update password
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword }
      });
      
      return res.status(200).json({
        success: true,
        message: 'Password updated successfully'
      });
    } catch (error) {
      console.error('Error updating password:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  };
  
  /**
   * Delete user account
   */
  public deleteAccount = async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      
      // Delete user and all related data
      await prisma.$transaction([
        // Delete notification preferences
        prisma.notificationPreferences.deleteMany({
          where: {
            userSettings: {
              userId
            }
          }
        }),
        // Delete user settings
        prisma.userSettings.deleteMany({
          where: { userId }
        }),
        // Delete workouts
        prisma.workout.deleteMany({
          where: { userId }
        }),
        // Delete training plans
        prisma.trainingPlan.deleteMany({
          where: { userId }
        }),
        // Delete user connections
        prisma.userConnection.deleteMany({
          where: { userId }
        }),
        // Delete user
        prisma.user.delete({
          where: { id: userId }
        })
      ]);
      
      return res.status(200).json({
        success: true,
        message: 'Account deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting account:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  };

  /**
   * Get user statistics
   */
  public getStatistics = async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      
      // Get user's total completed workouts
      const totalWorkouts = await prisma.workout.count({
        where: {
          userId,
          status: 'completed'
        }
      });
      
      // Get total distance
      const distanceResult = await prisma.workout.aggregate({
        where: {
          userId,
          status: 'completed',
          actualDistance: {
            not: null
          }
        },
        _sum: {
          actualDistance: true
        }
      });
      
      // Get total duration
      const durationResult = await prisma.workout.aggregate({
        where: {
          userId,
          status: 'completed',
          actualDuration: {
            not: null
          }
        },
        _sum: {
          actualDuration: true
        }
      });
      
      // Calculate totals
      const totalDistance = distanceResult._sum.actualDistance || 0;
      const totalDuration = durationResult._sum.actualDuration || 0;
      
      // Get workout types distribution
      const workoutTypes = await prisma.workout.groupBy({
        by: ['type'],
        where: {
          userId,
          status: 'completed'
        },
        _count: true
      });
      
      // Get recent personal bests
      const userRunnerProfile = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          runnerProfile: true
        }
      });
      
      const personalBests = userRunnerProfile?.runnerProfile?.personalBests || [];
      
      return res.status(200).json({
        success: true,
        data: {
          totalWorkouts,
          totalDistance,
          totalDuration,
          workoutTypeDistribution: workoutTypes.map(type => ({
            type: type.type,
            count: type._count
          })),
          personalBests
        }
      });
    } catch (error) {
      console.error('Error getting user statistics:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  };
  
  /**
   * Get user runner profile
   */
  public getRunnerProfile = async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          runnerProfile: true
        }
      });
      
      if (!user || !user.runnerProfile) {
        return res.status(404).json({
          success: false,
          message: 'Runner profile not found'
        });
      }
      
      return res.status(200).json({
        success: true,
        data: user.runnerProfile
      });
    } catch (error) {
      console.error('Error getting runner profile:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  };
  
  /**
   * Update user runner profile
   */
  public updateRunnerProfile = async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const {
        fitnessLevel,
        weeklyDistance,
        weeklyFrequency,
        recentRaces,
        preferredRunTypes,
        injuryHistory,
        personalBests
      } = req.body;
      
      // Get the user to check if runner profile exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          runnerProfile: true
        }
      });
      
      let updatedProfile;
      
      // If profile exists, update it
      if (user?.runnerProfile) {
        updatedProfile = await prisma.runnerProfile.update({
          where: { id: user.runnerProfile.id },
          data: {
            fitnessLevel,
            weeklyDistance,
            weeklyFrequency,
            recentRaces,
            preferredRunTypes,
            injuryHistory,
            personalBests
          }
        });
      } else {
        // If profile doesn't exist, create it
        updatedProfile = await prisma.runnerProfile.create({
          data: {
            user: {
              connect: { id: userId }
            },
            fitnessLevel,
            weeklyDistance,
            weeklyFrequency,
            recentRaces,
            preferredRunTypes,
            injuryHistory,
            personalBests
          }
        });
      }
      
      return res.status(200).json({
        success: true,
        data: updatedProfile,
        message: 'Runner profile updated successfully'
      });
    } catch (error) {
      console.error('Error updating runner profile:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  };
  
  /**
   * Get user connections to third-party services
   */
  public getConnections = async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      
      const connections = await prisma.userConnection.findMany({
        where: { userId }
      });
      
      return res.status(200).json({
        success: true,
        data: connections
      });
    } catch (error) {
      console.error('Error getting user connections:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  };
  
  /**
   * Connect user to Strava
   */
  public connectStrava = async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const { code } = req.body;
      
      if (!code) {
        return res.status(400).json({
          success: false,
          message: 'Strava authorization code is required'
        });
      }
      
      // Exchange authorization code for tokens
      // In a real implementation, you would make a request to Strava API
      // For this example, we'll simulate it
      const stravaTokens = {
        accessToken: 'simulated_access_token',
        refreshToken: 'simulated_refresh_token',
        expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000) // 6 hours from now
      };
      
      // Check if connection already exists
      const existingConnection = await prisma.userConnection.findFirst({
        where: {
          userId,
          provider: 'strava'
        }
      });
      
      let connection;
      
      if (existingConnection) {
        // Update existing connection
        connection = await prisma.userConnection.update({
          where: { id: existingConnection.id },
          data: {
            accessToken: stravaTokens.accessToken,
            refreshToken: stravaTokens.refreshToken,
            expiresAt: stravaTokens.expiresAt,
            lastSyncAt: new Date()
          }
        });
      } else {
        // Create new connection
        connection = await prisma.userConnection.create({
          data: {
            userId,
            provider: 'strava',
            accessToken: stravaTokens.accessToken,
            refreshToken: stravaTokens.refreshToken,
            expiresAt: stravaTokens.expiresAt,
            lastSyncAt: new Date()
          }
        });
      }
      
      return res.status(200).json({
        success: true,
        data: {
          id: connection.id,
          provider: connection.provider,
          connectedAt: connection.createdAt,
          lastSyncAt: connection.lastSyncAt
        },
        message: 'Connected to Strava successfully'
      });
    } catch (error) {
      console.error('Error connecting to Strava:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to connect to Strava'
      });
    }
  };
  
  /**
   * Disconnect user from Strava
   */
  public disconnectStrava = async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      
      // Delete the Strava connection
      await prisma.userConnection.deleteMany({
        where: {
          userId,
          provider: 'strava'
        }
      });
      
      return res.status(200).json({
        success: true,
        message: 'Disconnected from Strava successfully'
      });
    } catch (error) {
      console.error('Error disconnecting from Strava:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to disconnect from Strava'
      });
    }
  };
  
  /**
   * Strava webhook handler
   */
  public stravaWebhook = async (req: Request, res: Response) => {
    try {
      // Handle webhook verification request
      if (req.method === 'GET') {
        const { hub_challenge, hub_verify_token } = req.query;
        
        // Verify the webhook
        if (hub_verify_token === process.env.STRAVA_VERIFY_TOKEN) {
          return res.status(200).json({
            'hub.challenge': hub_challenge
          });
        } else {
          return res.status(403).json({
            success: false,
            message: 'Invalid verification token'
          });
        }
      }
      
      // Handle webhook events
      const event = req.body;
      
      // Log the event
      console.log('Received Strava webhook event:', event);
      
      // Process the event
      if (event.object_type === 'activity' && event.aspect_type === 'create') {
        // New activity created
        // In a real implementation, you would fetch the activity and sync it
        // For this example, we'll just acknowledge receipt
      }
      
      return res.status(200).json({
        success: true,
        message: 'Webhook received'
      });
    } catch (error) {
      console.error('Error processing Strava webhook:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to process webhook'
      });
    }
  };
  
  /**
   * Strava OAuth callback handler
   */
  public stravaCallback = async (req: Request, res: Response) => {
    try {
      const { code, state } = req.query;
      
      // Validate state parameter to prevent CSRF attacks
      // In a real implementation, this would be compared against a stored value
      
      if (!code) {
        return res.status(400).json({
          success: false,
          message: 'Missing authorization code'
        });
      }
      
      // Redirect to frontend with the code
      // The frontend will call the connectStrava endpoint with the code
      return res.redirect(`${process.env.FRONTEND_URL}/connect/strava/callback?code=${code}`);
    } catch (error) {
      console.error('Error handling Strava callback:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to process Strava callback'
      });
    }
  };
  
  /**
   * Connect user to Garmin
   */
  public connectGarmin = async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: 'Garmin username and password are required'
        });
      }
      
      // In a real implementation, you would authenticate with Garmin API
      // For this example, we'll simulate it
      const garminTokens = {
        accessToken: 'simulated_garmin_token',
        userId: 'garmin_user_id'
      };
      
      // Check if connection already exists
      const existingConnection = await prisma.userConnection.findFirst({
        where: {
          userId,
          provider: 'garmin'
        }
      });
      
      let connection;
      
      if (existingConnection) {
        // Update existing connection
        connection = await prisma.userConnection.update({
          where: { id: existingConnection.id },
          data: {
            accessToken: garminTokens.accessToken,
            providerUserId: garminTokens.userId,
            lastSyncAt: new Date()
          }
        });
      } else {
        // Create new connection
        connection = await prisma.userConnection.create({
          data: {
            userId,
            provider: 'garmin',
            accessToken: garminTokens.accessToken,
            providerUserId: garminTokens.userId,
            lastSyncAt: new Date()
          }
        });
      }
      
      return res.status(200).json({
        success: true,
        data: {
          id: connection.id,
          provider: connection.provider,
          connectedAt: connection.createdAt,
          lastSyncAt: connection.lastSyncAt
        },
        message: 'Connected to Garmin successfully'
      });
    } catch (error) {
      console.error('Error connecting to Garmin:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to connect to Garmin'
      });
    }
  };
  
  /**
   * Disconnect user from Garmin
   */
  public disconnectGarmin = async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      
      // Delete the Garmin connection
      await prisma.userConnection.deleteMany({
        where: {
          userId,
          provider: 'garmin'
        }
      });
      
      return res.status(200).json({
        success: true,
        message: 'Disconnected from Garmin successfully'
      });
    } catch (error) {
      console.error('Error disconnecting from Garmin:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to disconnect from Garmin'
      });
    }
  };
} 