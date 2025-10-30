import { Router } from "express";
import authRouter from './routes/auth.route.js';
import departmentRouter from './routes/department.route.js';

const router = Router();

router.use('/auth',authRouter)
router.use('/departments', departmentRouter);

export default router;