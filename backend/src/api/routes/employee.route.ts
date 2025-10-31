import { Router } from 'express';
import { employeeController } from '../controllers/employee.controller.js';
import { requireAuth, isHR } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(requireAuth, isHR);

router.get('/', employeeController.getAllEmployees);

router.get('/:id', employeeController.getEmployeeById);

router.patch('/:id', employeeController.updateEmployee);

router.delete('/:id', employeeController.deactivateEmployee);
router.get('/:id/leaves', employeeController.getEmployeeLeaves);

export default router;