import { ObjectId } from 'mongodb';
import { getDB } from '../config/db.js';

export class Stats {
  static async getAdminStats() {
    const db = getDB();
    
    const totalTasks = await db.collection('tasks').countDocuments();
    const pendingTasks = await db.collection('tasks').countDocuments({ status: 'pending' });
    const inProgressTasks = await db.collection('tasks').countDocuments({ status: 'in_progress' });
    const completedTasks = await db.collection('tasks').countDocuments({ status: 'completed' });

    const totalUsers = await db.collection('users').countDocuments();
    const adminUsers = await db.collection('users').countDocuments({ role: 'admin' });
    const regularUsers = await db.collection('users').countDocuments({ role: 'user' });

    return {
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
    };
  }

  static async getUserStats(userId) {
    const db = getDB();
    
    // ObjectId'ye çevir
    let userObjectId = userId;
    if (typeof userId === 'string' && userId.length === 24) {
      userObjectId = new ObjectId(userId);
    }

    const userTasks = await db.collection('tasks')
      .find({ assignedTo: userObjectId })
      .toArray();

    const totalTasks = userTasks.length;
    const pendingTasks = userTasks.filter(t => t.status === 'pending').length;
    const inProgressTasks = userTasks.filter(t => t.status === 'in_progress').length;
    const completedTasks = userTasks.filter(t => t.status === 'completed').length;

    return {
      tasks: {
        total: totalTasks,
        pending: pendingTasks,
        in_progress: inProgressTasks,
        completed: completedTasks
      }
    };
  }
}
