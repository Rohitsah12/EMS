import { Router } from 'express';
import { attendanceController } from '../controllers/attendance.controller.js';
import { requireAuth, isHR } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(requireAuth, isHR);
router.get('/summary', attendanceController.getAttendanceSummary);

router.get('/employee/:id', attendanceController.getEmployeeAttendance);

router.get('/', attendanceController.getAllAttendance);

router.post('/', attendanceController.createOrUpdateAttendance);

router.get('/:id', attendanceController.getAttendanceById);

router.patch('/:id', attendanceController.updateAttendance);

router.delete('/:id', attendanceController.deleteAttendance);

export default router;