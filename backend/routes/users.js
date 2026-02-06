import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import { verifyAdmin } from '../middleware/verifyAdmin.js';
import { UserController } from '../controllers/UserController.js';

const router = express.Router();


router.get('/', verifyToken, verifyAdmin, UserController.getUsers);
router.get('/:id', verifyToken, verifyAdmin, UserController.getUser);
router.put('/:id', verifyToken, UserController.updateUser);
router.delete('/:id', verifyToken, verifyAdmin, UserController.deleteUser);

export default router;