import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import { verifyAdmin } from '../middleware/verifyAdmin.js';
import { TaskController } from '../controllers/TaskController.js';

const router = express.Router();



router.post('/', verifyToken, verifyAdmin, TaskController.createTask);
router.get('/', verifyToken, TaskController.getTasks);
router.put('/:id', verifyToken, TaskController.updateTask);
router.delete('/:id', verifyToken, verifyAdmin, TaskController.deleteTask);

export default router;