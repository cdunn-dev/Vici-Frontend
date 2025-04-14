import * as express from 'express';
import { authenticateJwt } from '../middleware/auth';
import { UserController } from '../controllers/user.controller';

const router = express.Router();
const userController = new UserController();

/**
 * @route GET /api/users/profile
 * @desc Get current user profile
 * @access Private
 */
router.get('/profile', authenticateJwt, userController.getCurrentUser);

/**
 * @route PUT /api/users/profile
 * @desc Update user profile
 * @access Private
 */
router.put('/profile', authenticateJwt, userController.updateProfile);

/**
 * @route PUT /api/users/settings
 * @desc Update user settings
 * @access Private
 */
router.put('/settings', authenticateJwt, userController.updateSettings);

/**
 * @route PUT /api/users/password
 * @desc Update user password
 * @access Private
 */
router.put('/password', authenticateJwt, userController.updatePassword);

/**
 * @route DELETE /api/users
 * @desc Delete user account
 * @access Private
 */
router.delete('/', authenticateJwt, userController.deleteAccount);

/**
 * @route GET /api/users/statistics
 * @desc Get user training statistics
 * @access Private
 */
router.get('/statistics', authenticateJwt, userController.getStatistics);

/**
 * Runner Profile Routes
 */

/**
 * @route GET /api/users/runner-profile
 * @desc Get user runner profile
 * @access Private
 */
router.get('/runner-profile', authenticateJwt, userController.getRunnerProfile);

/**
 * @route PUT /api/users/runner-profile
 * @desc Update user runner profile
 * @access Private
 */
router.put('/runner-profile', authenticateJwt, userController.updateRunnerProfile);

/**
 * Connection Routes
 */

/**
 * @route GET /api/users/connections
 * @desc Get user connections to third-party services
 * @access Private
 */
router.get('/connections', authenticateJwt, userController.getConnections);

/**
 * @route POST /api/users/connections/strava
 * @desc Connect user to Strava
 * @access Private
 */
router.post('/connections/strava', authenticateJwt, userController.connectStrava);

/**
 * @route DELETE /api/users/connections/strava
 * @desc Disconnect user from Strava
 * @access Private
 */
router.delete('/connections/strava', authenticateJwt, userController.disconnectStrava);

/**
 * @route POST /api/users/connections/strava/webhook
 * @desc Webhook for Strava events
 * @access Public
 */
router.post('/connections/strava/webhook', userController.stravaWebhook);

/**
 * @route GET /api/users/connections/strava/callback
 * @desc Callback for Strava OAuth
 * @access Private
 */
router.get('/connections/strava/callback', userController.stravaCallback);

/**
 * @route POST /api/users/connections/garmin
 * @desc Connect user to Garmin
 * @access Private
 */
router.post('/connections/garmin', authenticateJwt, userController.connectGarmin);

/**
 * @route DELETE /api/users/connections/garmin
 * @desc Disconnect user from Garmin
 * @access Private
 */
router.delete('/connections/garmin', authenticateJwt, userController.disconnectGarmin);

export default router; 