import { Router } from 'express';
import { leaveController } from '../controllers/leave.controller.js';
import { requireAuth, isHR } from '../../middleware/auth.middleware.js';

const router = Router();


router.use(requireAuth, isHR);

router.get('/', leaveController.getAllLeaves);
router.get('/statistics', leaveController.getLeaveStatistics);
router.patch('/:id/status', leaveController.updateLeaveStatus);

export default router;