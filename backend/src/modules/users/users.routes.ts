import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { auditMiddleware } from '../../middleware/audit';
import { exportLimiter } from '../../middleware/rateLimiter';
import {
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  changePasswordHandler,
  exportCsvHandler,
  getDashboardStats,
} from './users.controller';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /users:
 *   get:
 *     tags: [Users]
 *     summary: List users with filtering and pagination
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: departmentId
 *         schema:
 *           type: string
 *       - in: query
 *         name: roleId
 *         schema:
 *           type: string
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: string
 *           enum: [true, false]
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of users
 */
router.get('/', authorize('users:read'), listUsers);

/**
 * @openapi
 * /users/dashboard/stats:
 *   get:
 *     tags: [Users]
 *     summary: Get dashboard statistics
 *     responses:
 *       200:
 *         description: Dashboard stats
 */
router.get('/dashboard/stats', authorize('users:read'), getDashboardStats);

/**
 * @openapi
 * /users/export/csv:
 *   get:
 *     tags: [Users]
 *     summary: Export users as CSV
 *     responses:
 *       200:
 *         description: CSV file
 */
router.get('/export/csv', authorize('csv:export'), exportLimiter, exportCsvHandler);

/**
 * @openapi
 * /users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get user by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User found
 *       404:
 *         description: User not found
 */
router.get('/:id', authorize('users:read'), getUser);

/**
 * @openapi
 * /users:
 *   post:
 *     tags: [Users]
 *     summary: Create a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User created
 */
router.post('/', authorize('users:write'), auditMiddleware, createUser);

/**
 * @openapi
 * /users/{id}:
 *   patch:
 *     tags: [Users]
 *     summary: Update user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User updated
 */
router.patch('/:id', authorize('users:write'), auditMiddleware, updateUser);

/**
 * @openapi
 * /users/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: Soft delete user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: User deleted
 */
router.delete('/:id', authorize('users:delete'), auditMiddleware, deleteUser);

/**
 * @openapi
 * /users/me/change-password:
 *   post:
 *     tags: [Users]
 *     summary: Change current user password
 *     responses:
 *       204:
 *         description: Password changed
 */
router.post('/me/change-password', changePasswordHandler);

export default router;
