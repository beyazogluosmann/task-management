import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import { StatsController } from '../controllers/StatsController.js';

const router = express.Router();

router.get('/', verifyToken, StatsController.getStats);

export default router;