import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { listAuditLogs, getDistinctResources, getRecentActivity } from './audit-logs.controller';

const router = Router();

router.use(authenticate);
router.use(authorize('audit-logs:read'));

/**
 * @openapi
 * /audit-logs:
 *   get:
 *     tags: [Audit Logs]
 *     summary: List audit logs with filtering
 *     parameters:
 *       - in: query
 *         name: resource
 *         schema:
 *           type: string
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Audit log entries
 */
router.get('/', listAuditLogs);
router.get('/resources', getDistinctResources);
router.get('/recent', getRecentActivity);

export default router;
