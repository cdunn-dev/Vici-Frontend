import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Controller for training-related operations
 */
export class TrainingController {
  /**
   * Get all training plans for the current user
   */
  public getPlans = async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      
      const plans = await prisma.trainingPlan.findMany({
        where: { userId },
        include: {
          _count: {
            select: { workouts: true }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      return res.status(200).json({
        success: true,
        data: plans
      });
    } catch (error) {
      console.error('Error getting training plans:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  };
  
  /**
   * Get training plan by ID
   */
  public getPlanById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      const plan = await prisma.trainingPlan.findUnique({
        where: { id },
        include: {
          workouts: {
            orderBy: {
              scheduledDate: 'asc'
            }
          }
        }
      });
      
      if (!plan) {
        return res.status(404).json({
          success: false,
          message: 'Training plan not found'
        });
      }
      
      // Make sure the plan belongs to the current user
      if (plan.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this plan'
        });
      }
      
      return res.status(200).json({
        success: true,
        data: plan
      });
    } catch (error) {
      console.error('Error getting training plan:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  };
  
  /**
   * Create a new training plan
   */
  public createPlan = async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const { goal, settings, status = 'Active' } = req.body;
      
      // Validate input
      if (!goal || !settings) {
        return res.status(400).json({
          success: false,
          message: 'Goal and settings are required'
        });
      }
      
      // Create new plan
      const plan = await prisma.trainingPlan.create({
        data: {
          userId,
          status,
          goal,
          settings
        }
      });
      
      return res.status(201).json({
        success: true,
        data: plan,
        message: 'Training plan created successfully'
      });
    } catch (error) {
      console.error('Error creating training plan:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  };
  
  /**
   * Update a training plan
   */
  public updatePlan = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { goal, settings, status } = req.body;
      
      // Check if plan exists and belongs to user
      const existingPlan = await prisma.trainingPlan.findUnique({
        where: { id }
      });
      
      if (!existingPlan) {
        return res.status(404).json({
          success: false,
          message: 'Training plan not found'
        });
      }
      
      if (existingPlan.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this plan'
        });
      }
      
      // Update plan
      const updatedPlan = await prisma.trainingPlan.update({
        where: { id },
        data: {
          goal,
          settings,
          status
        }
      });
      
      return res.status(200).json({
        success: true,
        data: updatedPlan,
        message: 'Training plan updated successfully'
      });
    } catch (error) {
      console.error('Error updating training plan:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  };
  
  /**
   * Delete a training plan
   */
  public deletePlan = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      // Check if plan exists and belongs to user
      const existingPlan = await prisma.trainingPlan.findUnique({
        where: { id }
      });
      
      if (!existingPlan) {
        return res.status(404).json({
          success: false,
          message: 'Training plan not found'
        });
      }
      
      if (existingPlan.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to delete this plan'
        });
      }
      
      // Delete related workouts first
      await prisma.workout.deleteMany({
        where: { trainingPlanId: id }
      });
      
      // Delete plan
      await prisma.trainingPlan.delete({
        where: { id }
      });
      
      return res.status(200).json({
        success: true,
        message: 'Training plan deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting training plan:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  };
  
  /**
   * Get all workouts for the current user
   */
  public getWorkouts = async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      
      // Filter options
      const { 
        status, 
        type, 
        startDate, 
        endDate,
        limit = 20,
        page = 1
      } = req.query;
      
      const skip = (Number(page) - 1) * Number(limit);
      
      // Build where clause
      const where: any = { userId };
      
      if (status) {
        where.status = status;
      }
      
      if (type) {
        where.type = type;
      }
      
      // Date filtering
      if (startDate || endDate) {
        where.scheduledDate = {};
        
        if (startDate) {
          where.scheduledDate.gte = new Date(startDate as string);
        }
        
        if (endDate) {
          where.scheduledDate.lte = new Date(endDate as string);
        }
      }
      
      // Get workouts with pagination
      const [workouts, total] = await Promise.all([
        prisma.workout.findMany({
          where,
          orderBy: {
            scheduledDate: 'desc'
          },
          skip,
          take: Number(limit)
        }),
        prisma.workout.count({ where })
      ]);
      
      return res.status(200).json({
        success: true,
        data: workouts,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      console.error('Error getting workouts:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  };
  
  /**
   * Get workout by ID
   */
  public getWorkoutById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      const workout = await prisma.workout.findUnique({
        where: { id },
        include: {
          trainingPlan: true
        }
      });
      
      if (!workout) {
        return res.status(404).json({
          success: false,
          message: 'Workout not found'
        });
      }
      
      // Make sure the workout belongs to the current user
      if (workout.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this workout'
        });
      }
      
      return res.status(200).json({
        success: true,
        data: workout
      });
    } catch (error) {
      console.error('Error getting workout:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  };
  
  /**
   * Get all workouts for a specific training plan
   */
  public getPlanWorkouts = async (req: Request, res: Response) => {
    try {
      const { planId } = req.params;
      const userId = req.user.id;
      
      // Check if plan exists and belongs to user
      const plan = await prisma.trainingPlan.findUnique({
        where: { id: planId }
      });
      
      if (!plan) {
        return res.status(404).json({
          success: false,
          message: 'Training plan not found'
        });
      }
      
      if (plan.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this plan'
        });
      }
      
      // Get workouts for plan
      const workouts = await prisma.workout.findMany({
        where: { trainingPlanId: planId },
        orderBy: {
          scheduledDate: 'asc'
        }
      });
      
      return res.status(200).json({
        success: true,
        data: workouts
      });
    } catch (error) {
      console.error('Error getting plan workouts:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  };
  
  /**
   * Create a new workout
   */
  public createWorkout = async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const { 
        trainingPlanId,
        type,
        title,
        description,
        scheduledDate,
        duration,
        distance,
        steps,
        status = 'scheduled'
      } = req.body;
      
      // Validate input
      if (!title || !scheduledDate || !type) {
        return res.status(400).json({
          success: false,
          message: 'Title, scheduled date, and type are required'
        });
      }
      
      // If training plan is specified, verify it exists and belongs to user
      if (trainingPlanId) {
        const plan = await prisma.trainingPlan.findUnique({
          where: { id: trainingPlanId }
        });
        
        if (!plan) {
          return res.status(404).json({
            success: false,
            message: 'Training plan not found'
          });
        }
        
        if (plan.userId !== userId) {
          return res.status(403).json({
            success: false,
            message: 'Not authorized to add workouts to this plan'
          });
        }
      }
      
      // Create new workout
      const workout = await prisma.workout.create({
        data: {
          userId,
          trainingPlanId,
          type,
          title,
          description,
          scheduledDate: new Date(scheduledDate),
          duration,
          distance,
          steps,
          status
        }
      });
      
      return res.status(201).json({
        success: true,
        data: workout,
        message: 'Workout created successfully'
      });
    } catch (error) {
      console.error('Error creating workout:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  };
  
  /**
   * Update a workout
   */
  public updateWorkout = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { 
        type,
        title,
        description,
        scheduledDate,
        duration,
        distance,
        steps,
        status
      } = req.body;
      
      // Check if workout exists and belongs to user
      const existingWorkout = await prisma.workout.findUnique({
        where: { id }
      });
      
      if (!existingWorkout) {
        return res.status(404).json({
          success: false,
          message: 'Workout not found'
        });
      }
      
      if (existingWorkout.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this workout'
        });
      }
      
      // Update workout
      const updatedWorkout = await prisma.workout.update({
        where: { id },
        data: {
          type,
          title,
          description,
          scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
          duration,
          distance,
          steps,
          status
        }
      });
      
      return res.status(200).json({
        success: true,
        data: updatedWorkout,
        message: 'Workout updated successfully'
      });
    } catch (error) {
      console.error('Error updating workout:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  };
  
  /**
   * Mark a workout as completed
   */
  public completeWorkout = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { 
        actualDuration,
        actualDistance,
        completedDate = new Date(),
        notes,
        rating
      } = req.body;
      
      // Check if workout exists and belongs to user
      const existingWorkout = await prisma.workout.findUnique({
        where: { id }
      });
      
      if (!existingWorkout) {
        return res.status(404).json({
          success: false,
          message: 'Workout not found'
        });
      }
      
      if (existingWorkout.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this workout'
        });
      }
      
      // Update workout with completion data
      const completedWorkout = await prisma.workout.update({
        where: { id },
        data: {
          status: 'completed',
          completedDate: new Date(completedDate),
          actualDuration,
          actualDistance,
          notes,
          rating
        }
      });
      
      return res.status(200).json({
        success: true,
        data: completedWorkout,
        message: 'Workout marked as completed'
      });
    } catch (error) {
      console.error('Error completing workout:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  };
  
  /**
   * Delete a workout
   */
  public deleteWorkout = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      // Check if workout exists and belongs to user
      const existingWorkout = await prisma.workout.findUnique({
        where: { id }
      });
      
      if (!existingWorkout) {
        return res.status(404).json({
          success: false,
          message: 'Workout not found'
        });
      }
      
      if (existingWorkout.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to delete this workout'
        });
      }
      
      // Delete workout
      await prisma.workout.delete({
        where: { id }
      });
      
      return res.status(200).json({
        success: true,
        message: 'Workout deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting workout:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  };
} 