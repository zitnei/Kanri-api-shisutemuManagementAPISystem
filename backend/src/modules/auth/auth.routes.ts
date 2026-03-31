import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authLimiter } from '../../middleware/rateLimiter';
import {
  loginHandler,
  refreshHandler,
  logoutHandler,
  logoutAllHandler,
  profileHandler,
} from './auth.controller';

const router = Router();

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login with email and password
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', authLimiter, loginHandler);

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh access token
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tokens refreshed
 *       401:
 *         description: Invalid refresh token
 */
router.post('/refresh', refreshHandler);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout (invalidate refresh token)
 *     responses:
 *       204:
 *         description: Logged out successfully
 */
router.post('/logout', authenticate, logoutHandler);

/**
 * @openapi
 * /auth/logout-all:
 *   post:
 *     tags: [Auth]
 *     summary: Logout from all devices
 *     responses:
 *       204:
 *         description: Logged out from all devices
 */
router.post('/logout-all', authenticate, logoutAllHandler);

/**
 * @openapi
 * /auth/profile:
 *   get:
 *     tags: [Auth]
 *     summary: Get current user profile
 *     responses:
 *       200:
 *         description: User profile
 */
router.get('/profile', authenticate, profileHandler);

export default router;
