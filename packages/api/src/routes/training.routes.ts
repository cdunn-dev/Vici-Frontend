import express from 'express';
import { authenticateJwt } from '../middleware/auth';
import { TrainingController } from '../controllers/training.controller';

const router = express.Router();
const trainingController = new TrainingController();

/**
 * Training Plan Routes
 */

/**
 * @route GET /api/training/plans
 * @desc Get all training plans for the current user
 * @access Private
 */
router.get('/plans', authenticateJwt, trainingController.getPlans);

/**
 * @route GET /api/training/plans/:id
 * @desc Get training plan by ID
 * @access Private
 */
router.get('/plans/:id', authenticateJwt, trainingController.getPlanById);

/**
 * @route POST /api/training/plans
 * @desc Create a new training plan
 * @access Private
 */
router.post('/plans', authenticateJwt, trainingController.createPlan);

/**
 * @route PUT /api/training/plans/:id
 * @desc Update a training plan
 * @access Private
 */
router.put('/plans/:id', authenticateJwt, trainingController.updatePlan);

/**
 * @route DELETE /api/training/plans/:id
 * @desc Delete a training plan
 * @access Private
 */
router.delete('/plans/:id', authenticateJwt, trainingController.deletePlan);

/**
 * @route POST /api/training/plans/:planId/approve
 * @desc Approve a training plan preview, making it active.
 * @access Private
 */
router.post('/plans/:planId/approve', authenticateJwt, trainingController.approvePlan);

/**
 * @route POST /api/training/plans/:planId/ask-vici
 * @desc Send a query or adjustment request to the AI assistant for a specific plan.
 * @access Private
 */
router.post('/plans/:planId/ask-vici', authenticateJwt, trainingController.askVici);

/**
 * Workout Routes
 */

/**
 * @route GET /api/training/workouts
 * @desc Get all workouts for the current user
 * @access Private
 */
router.get('/workouts', authenticateJwt, trainingController.getWorkouts);

/**
 * @route GET /api/training/workouts/:id
 * @desc Get workout by ID
 * @access Private
 */
router.get('/workouts/:id', authenticateJwt, trainingController.getWorkoutById);

/**
 * @route GET /api/training/plans/:planId/workouts
 * @desc Get all workouts for a specific training plan
 * @access Private
 */
router.get('/plans/:planId/workouts', authenticateJwt, trainingController.getPlanWorkouts);

/**
 * @route POST /api/training/workouts
 * @desc Create a new workout
 * @access Private
 */
router.post('/workouts', authenticateJwt, trainingController.createWorkout);

/**
 * @route PUT /api/training/workouts/:id
 * @desc Update a workout
 * @access Private
 */
router.put('/workouts/:id', authenticateJwt, trainingController.updateWorkout);

/**
 * @route PUT /api/training/workouts/:id/complete
 * @desc Mark a workout as completed
 * @access Private
 */
router.put('/workouts/:id/complete', authenticateJwt, trainingController.completeWorkout);

/**
 * @route DELETE /api/training/workouts/:id
 * @desc Delete a workout
 * @access Private
 */
router.delete('/workouts/:id', authenticateJwt, trainingController.deleteWorkout);

export default router; 