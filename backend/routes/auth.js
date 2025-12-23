import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import { AuthController } from '../controllers/AuthController.js';

const router = express.Router();


router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/logout', AuthController.logout);
router.get('/current-user', verifyToken, AuthController.getCurrentUser);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);

export default router;