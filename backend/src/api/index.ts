import { Router } from "express";
import authRouter from './routes/auth.route.js';
import departmentRouter from './routes/department.route.js';
import employeeRouter from './routes/employee.route.js';
import leaveRouter from './routes/leave.route.js';

const router = Router();

router.use('/auth',authRouter)
router.use('/departments', departmentRouter);
router.use('/employees', employeeRouter);
router.use('/leaves', leaveRouter);

export default router;