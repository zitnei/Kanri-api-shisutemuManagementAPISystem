import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { auditMiddleware } from '../../middleware/audit';
import {
  listApprovals,
  getApproval,
  createApproval,
  approveRequest,
  rejectRequest,
  cancelRequest,
  getStatusSummary,
} from './approvals.controller';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /approvals:
 *   get:
 *     tags: [Approvals]
 *     summary: List approval requests
 *     responses:
 *       200:
 *         description: List of approval requests
 */
router.get('/', authorize('approvals:read'), listApprovals);
router.get('/summary', authorize('approvals:read'), getStatusSummary);
router.get('/:id', authorize('approvals:read'), getApproval);

/**
 * @openapi
 * /approvals:
 *   post:
 *     tags: [Approvals]
 *     summary: Create approval request
 *     responses:
 *       201:
 *         description: Approval request created
 */
router.post('/', authorize('approvals:write'), auditMiddleware, createApproval);
router.post('/:id/approve', authorize('approvals:approve'), auditMiddleware, approveRequest);
router.post('/:id/reject', authorize('approvals:approve'), auditMiddleware, rejectRequest);
router.delete('/:id', authorize('approvals:write'), cancelRequest);

export default router;
