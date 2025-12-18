import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import { verifyAdmin } from '../middleware/verifyAdmin.js';
import { getDB } from '../config/db.js';

const router = express.Router();

router.get('/', verifyToken, async (req, res) => {
    try {
        const db = getDB();
        const userId = req.user.id || req.user._id;

        if (req.user.role === 'admin') {
            const totalTasks = await db.collection('tasks').countDocuments();
            const pendingTasks = await db.collection('tasks').countDocuments({ status: 'pending' });
            const inProgressTasks = await db.collection('tasks').countDocuments({ status: 'in_progress' });
            const completedTasks = await db.collection('tasks').countDocuments({ status: 'completed' });

            const totalUsers = await db.collection('users').countDocuments();
            const adminUsers = await db.collection('users').countDocuments({ role: 'admin' });
            const regularUsers = await db.collection('users').countDocuments({ role: 'user' });

            return res.status(200).json({
                message: 'Statistics retrieved successfully',
                tasks: {
                    total: totalTasks,
                    pending: pendingTasks,
                    in_progress: inProgressTasks,
                    completed: completedTasks
                },
                users: {
                    total: totalUsers,
                    admins: adminUsers,
                    regularUsers: regularUsers
                }
            });
        }

        
        const userTasks = await db.collection('tasks').find({ assignedTo: userId }).toArray();
        const totalTasks = userTasks.length;
        const pendingTasks = userTasks.filter(t => t.status === 'pending').length;
        const inProgressTasks = userTasks.filter(t => t.status === 'in_progress').length;
        const completedTasks = userTasks.filter(t => t.status === 'completed').length;

        res.status(200).json({
            message: 'Your statistics',
            tasks: {
                total: totalTasks,
                pending: pendingTasks,
                in_progress: inProgressTasks,
                completed: completedTasks
            }
        });

    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            message: 'Error retrieving statistics',
            error: error.message
        });
    }
});

export default router;