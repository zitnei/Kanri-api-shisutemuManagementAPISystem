import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { exportLimiter } from '../../middleware/rateLimiter';
import { exportUsers, exportAuditLogs } from './csv.controller';

const router = Router();

router.use(authenticate);
router.use(exportLimiter);

/**
 * @openapi
 * /csv/users:
 *   get:
 *     tags: [CSV Export]
 *     summary: Export users as CSV
 *     responses:
 *       200:
 *         description: CSV file download
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 */
router.get('/users', authorize('csv:export'), exportUsers);

/**
 * @openapi
 * /csv/audit-logs:
 *   get:
 *     tags: [CSV Export]
 *     summary: Export audit logs as CSV
 *     responses:
 *       200:
 *         description: CSV file download
 */
router.get('/audit-logs', authorize('audit-logs:read', 'csv:export'), exportAuditLogs);

export default router;
