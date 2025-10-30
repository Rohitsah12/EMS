import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';

const router = Router();

router.post('/register', authController.registerEmployee);
router.post('/login', authController.loginEmployee);
router.post('/refresh', authController.refreshAccessToken);
router.post('/logout', requireAuth, authController.logoutEmployee);
router.get('/me', requireAuth, authController.getEmployeeProfile);
export default router;