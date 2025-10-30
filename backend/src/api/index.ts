import { Router } from "express";
import authRouter from './routes/auth.route.js';
import departmentRouter from './routes/department.route.js';
import employeeRouter from './routes/employee.route.js';
import leaveRouter from './routes/leave.route.js';
import salaryRouter from './routes/salary.route.js';
import attendanceRouter from './routes/attendance.route.js';
import dashboardRoutes from './routes/dashboard.route.js';

const router = Router();

router.use('/auth',authRouter)
router.use('/departments', departmentRouter);
router.use('/employees', employeeRouter);
router.use('/leaves', leaveRouter);
router.use('/salaries', salaryRouter);
router.use('/attendance', attendanceRouter);
router.use('/dashboard', dashboardRoutes);

export default router;