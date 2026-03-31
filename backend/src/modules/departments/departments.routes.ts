import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { auditMiddleware } from '../../middleware/audit';
import {
  listDepartments,
  getDepartmentTree,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from './departments.controller';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /departments:
 *   get:
 *     tags: [Departments]
 *     summary: List all departments
 *     parameters:
 *       - in: query
 *         name: includeInactive
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: List of departments
 */
router.get('/', authorize('departments:read'), listDepartments);

/**
 * @openapi
 * /departments/tree:
 *   get:
 *     tags: [Departments]
 *     summary: Get department tree structure
 *     responses:
 *       200:
 *         description: Department tree
 */
router.get('/tree', authorize('departments:read'), getDepartmentTree);

router.get('/:id', authorize('departments:read'), getDepartment);
router.post('/', authorize('departments:write'), auditMiddleware, createDepartment);
router.patch('/:id', authorize('departments:write'), auditMiddleware, updateDepartment);
router.delete('/:id', authorize('departments:delete'), auditMiddleware, deleteDepartment);

export default router;
