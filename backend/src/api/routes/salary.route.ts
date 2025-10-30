import { Router } from 'express';
import { salaryController } from '../controllers/salary.controller.js';
import { requireAuth, isHR } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(requireAuth, isHR);

router.post('/', salaryController.createSalary);

router.get('/employee/:employeeId', salaryController.getSalariesByEmployee);

router.patch('/:id', salaryController.updateSalary);

router.delete('/:id', salaryController.deleteSalary);

export default router;