import { Router } from 'express';
import { departmentController } from '../controllers/department.controller.js';
import { requireAuth, isHR } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(requireAuth);

router.get('/', departmentController.getAllDepartments);

router.post('/', isHR, departmentController.createDepartment);

router.get('/:id', departmentController.getDepartmentById);

router.patch('/:id', isHR, departmentController.updateDepartment);

router.delete('/:id', isHR, departmentController.deleteDepartment);

export default router;