import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Controller for analytics-related operations
 */
export class AnalyticsController {
  /**
   * Get user dashboard overview
   */
  public getOverview = async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;

      // Get user's training plans
      const plans = await prisma.trainingPlan.count({
        where: { userId }
      });
      
      // Get user's total workouts
      const totalWorkouts = await prisma.workout.count({
        where: { userId }
      });
      
      // Get user's completed workouts
      const completedWorkouts = await prisma.workout.count({
        where: { 
          userId,
          status: 'completed'
        }
      });
      
      // Get user's upcoming workouts
      const upcomingWorkouts = await prisma.workout.count({
        where: { 
          userId,
          status: 'scheduled',
          scheduledDate: {
            gte: new Date()
          }
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
      
      const totalDistance = distanceResult._sum.actualDistance || 0;
      
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
      
      const totalDuration = durationResult._sum.actualDuration || 0;
      
      // Recent activity
      const recentActivity = await prisma.workout.findMany({
        where: {
          userId,
          status: 'completed'
        },
        orderBy: {
          completedDate: 'desc'
        },
        take: 5,
        select: {
          id: true,
          title: true,
          type: true,
          completedDate: true,
          actualDistance: true,
          actualDuration: true
        }
      });
      
      return res.status(200).json({
        success: true,
        data: {
          plans,
          workouts: {
            total: totalWorkouts,
            completed: completedWorkouts,
            upcoming: upcomingWorkouts,
            completionRate: totalWorkouts > 0 ? (completedWorkouts / totalWorkouts) * 100 : 0
          },
          stats: {
            totalDistance,
            totalDuration,
            averagePace: totalDistance > 0 && totalDuration > 0 ? 
              (totalDuration / 60) / (totalDistance / 1000) : 0 // min/km
          },
          recentActivity
        }
      });
    } catch (error) {
      console.error('Error getting overview:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  };
  
  /**
   * Get user performance metrics
   */
  public getPerformance = async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const { 
        period = '30days'
      } = req.query;
      
      let startDate: Date;
      const endDate = new Date();
      
      // Set the start date based on the period
      switch (period) {
        case '7days':
          startDate = new Date();
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30days':
          startDate = new Date();
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90days':
          startDate = new Date();
          startDate.setDate(endDate.getDate() - 90);
          break;
        case '1year':
          startDate = new Date();
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
        default:
          startDate = new Date();
          startDate.setDate(endDate.getDate() - 30);
      }
      
      // Get workouts within the specified period
      const workouts = await prisma.workout.findMany({
        where: {
          userId,
          status: 'completed',
          completedDate: {
            gte: startDate,
            lte: endDate
          }
        },
        orderBy: {
          completedDate: 'asc'
        },
        select: {
          id: true,
          title: true,
          type: true,
          completedDate: true,
          actualDistance: true,
          actualDuration: true,
          rating: true
        }
      });
      
      // Calculate performance metrics
      const totalWorkouts = workouts.length;
      
      const distanceByType: Record<string, number> = {};
      const durationByType: Record<string, number> = {};
      const countByType: Record<string, number> = {};
      
      workouts.forEach(workout => {
        const type = workout.type || 'OTHER';
        
        // Initialize if not already
        if (!distanceByType[type]) distanceByType[type] = 0;
        if (!durationByType[type]) durationByType[type] = 0;
        if (!countByType[type]) countByType[type] = 0;
        
        // Add to totals
        if (workout.actualDistance) distanceByType[type] += workout.actualDistance;
        if (workout.actualDuration) durationByType[type] += workout.actualDuration;
        countByType[type]++;
      });
      
      // Calculate pace trends
      const paceTrends = Object.keys(distanceByType).map(type => {
        const distance = distanceByType[type];
        const duration = durationByType[type];
        const count = countByType[type];
        
        return {
          type,
          workouts: count,
          totalDistance: distance,
          totalDuration: duration,
          averagePace: distance > 0 && duration > 0 ? 
            (duration / 60) / (distance / 1000) : 0, // min/km
          averageDistance: count > 0 ? distance / count : 0,
          averageDuration: count > 0 ? duration / count : 0
        };
      });
      
      return res.status(200).json({
        success: true,
        data: {
          period,
          totalWorkouts,
          workouts,
          paceTrends,
          startDate,
          endDate
        }
      });
    } catch (error) {
      console.error('Error getting performance metrics:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  };
  
  /**
   * Get user training progress
   */
  public getProgress = async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const { planId } = req.query;
      
      // If planId is provided, get progress for a specific plan
      if (planId) {
        const plan = await prisma.trainingPlan.findUnique({
          where: { 
            id: planId as string,
            userId
          },
          include: {
            workouts: true
          }
        });
        
        if (!plan) {
          return res.status(404).json({
            success: false,
            message: 'Training plan not found'
          });
        }
        
        const totalWorkouts = plan.workouts.length;
        const completedWorkouts = plan.workouts.filter(w => w.status === 'completed').length;
        const completionRate = totalWorkouts > 0 ? (completedWorkouts / totalWorkouts) * 100 : 0;
        
        // Calculate timeline progress
        const startDate = plan.settings.startDate ? new Date(plan.settings.startDate) : null;
        const endDate = plan.settings.endDate ? new Date(plan.settings.endDate) : null;
        
        let timeProgress = 0;
        
        if (startDate && endDate) {
          const totalDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
          const elapsedDays = (new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
          
          timeProgress = Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100));
        }
        
        return res.status(200).json({
          success: true,
          data: {
            plan: {
              id: plan.id,
              status: plan.status,
              goal: plan.goal,
              startDate,
              endDate
            },
            progress: {
              completion: {
                total: totalWorkouts,
                completed: completedWorkouts,
                rate: completionRate
              },
              timeline: {
                progress: timeProgress,
                daysRemaining: endDate ? 
                  Math.max(0, Math.ceil((endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : 
                  null
              }
            }
          }
        });
      } else {
        // Get progress across all active plans
        const activePlans = await prisma.trainingPlan.findMany({
          where: { 
            userId,
            status: 'Active'
          },
          include: {
            workouts: true
          }
        });
        
        const plansProgress = activePlans.map(plan => {
          const totalWorkouts = plan.workouts.length;
          const completedWorkouts = plan.workouts.filter(w => w.status === 'completed').length;
          const completionRate = totalWorkouts > 0 ? (completedWorkouts / totalWorkouts) * 100 : 0;
          
          // Calculate timeline progress
          const startDate = plan.settings.startDate ? new Date(plan.settings.startDate) : null;
          const endDate = plan.settings.endDate ? new Date(plan.settings.endDate) : null;
          
          let timeProgress = 0;
          
          if (startDate && endDate) {
            const totalDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
            const elapsedDays = (new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
            
            timeProgress = Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100));
          }
          
          return {
            plan: {
              id: plan.id,
              status: plan.status,
              goal: plan.goal,
              startDate,
              endDate
            },
            progress: {
              completion: {
                total: totalWorkouts,
                completed: completedWorkouts,
                rate: completionRate
              },
              timeline: {
                progress: timeProgress,
                daysRemaining: endDate ? 
                  Math.max(0, Math.ceil((endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : 
                  null
              }
            }
          };
        });
        
        return res.status(200).json({
          success: true,
          data: {
            activePlans: plansProgress
          }
        });
      }
    } catch (error) {
      console.error('Error getting progress:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  };
  
  /**
   * Get AI-powered insights based on user's training
   */
  public getInsights = async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      
      // Get user's completed workouts
      const workouts = await prisma.workout.findMany({
        where: {
          userId,
          status: 'completed'
        },
        orderBy: {
          completedDate: 'desc'
        },
        take: 100 // Analyze last 100 workouts
      });
      
      if (workouts.length === 0) {
        return res.status(200).json({
          success: true,
          data: {
            insights: [
              {
                type: 'info',
                title: 'Not enough data',
                message: 'Complete more workouts to get personalized insights.'
              }
            ]
          }
        });
      }
      
      // Calculate training load
      const recentWorkouts = workouts.slice(0, 7);
      const previousWorkouts = workouts.slice(7, 14);
      
      let recentLoad = 0;
      let previousLoad = 0;
      
      recentWorkouts.forEach(workout => {
        if (workout.actualDuration) {
          // Simple load calculation - can be more sophisticated in a real app
          recentLoad += workout.actualDuration / 60; // Convert seconds to minutes
        }
      });
      
      previousWorkouts.forEach(workout => {
        if (workout.actualDuration) {
          previousLoad += workout.actualDuration / 60;
        }
      });
      
      // Calculate load change percentage
      const loadChangePercent = previousLoad > 0 ? 
        ((recentLoad - previousLoad) / previousLoad) * 100 : 0;
      
      // Generate insights based on data
      const insights = [];
      
      // Training load insight
      if (Math.abs(loadChangePercent) > 20) {
        insights.push({
          type: loadChangePercent > 0 ? 'warning' : 'info',
          title: loadChangePercent > 0 ? 'Training load increasing rapidly' : 'Training load decreasing',
          message: loadChangePercent > 0 ? 
            'Your training load has increased by more than 20% compared to the previous week. Consider adding more recovery time to avoid injury.' :
            'Your training load has decreased compared to the previous week. This could be good if you\'re in a recovery phase.'
        });
      }
      
      // Consistency insight
      const daysWithWorkouts = new Set();
      recentWorkouts.forEach(workout => {
        if (workout.completedDate) {
          daysWithWorkouts.add(new Date(workout.completedDate).toDateString());
        }
      });
      
      if (daysWithWorkouts.size < 3 && recentWorkouts.length < 3) {
        insights.push({
          type: 'info',
          title: 'Consistency opportunity',
          message: 'You\'ve worked out on fewer than 3 days in the past week. Aim for at least 3-4 training days per week for optimal progress.'
        });
      }
      
      // Workout variety insight
      const workoutTypes = new Set();
      recentWorkouts.forEach(workout => {
        if (workout.type) {
          workoutTypes.add(workout.type);
        }
      });
      
      if (workoutTypes.size < 2 && recentWorkouts.length >= 3) {
        insights.push({
          type: 'info',
          title: 'Add workout variety',
          message: 'You\'ve been focusing on one type of workout. Consider adding variety with different workout types for balanced training.'
        });
      }
      
      // Add at least one insight if none were generated
      if (insights.length === 0) {
        insights.push({
          type: 'success',
          title: 'You\'re on the right track',
          message: 'Your training looks well-balanced. Keep up the good work!'
        });
      }
      
      return res.status(200).json({
        success: true,
        data: {
          insights,
          stats: {
            recentLoad,
            previousLoad,
            loadChangePercent,
            workoutsAnalyzed: workouts.length
          }
        }
      });
    } catch (error) {
      console.error('Error generating insights:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  };
} 