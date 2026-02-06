import { Stats } from '../models/Stats.js';
import { ObjectId } from 'mongodb';

export class StatsController {
  static async getStats(req, res) {
    try {
      if (req.user.role === 'admin') {
        const stats = await Stats.getAdminStats();
        return res.status(200).json({
          message: 'Statistics retrieved successfully',
          ...stats
        });
      }

      const userId = req.user.id || req.user._id;
      const stats = await Stats.getUserStats(userId);
      
      res.status(200).json({
        message: 'Your statistics',
        ...stats
      });

    } catch (error) {
      console.error('Get stats error:', error);
      res.status(500).json({
        message: 'Error retrieving statistics',
        error: error.message
      });
    }
  }

  static async getTaskCounts(req, res) {
    try {
      const currentUser = req.user;
      const isAdmin = currentUser.role === 'admin';

      let query = {};
      if (!isAdmin) {
        query.assignedTo = new ObjectId(currentUser._id);
      }

      const counts = await Stats.getTaskCounts(query);

      res.status(200).json({
        message: 'Task counts retrieved successfully',
        counts
      });
    } catch (error) {
      console.error('Get task counts error:', error);
      res.status(500).json({
        message: 'Error retrieving task counts',
        error: error.message
      });
    }
  }
}
