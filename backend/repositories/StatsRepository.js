import { BaseRepository } from './BaseRepository.js';

export class StatsRepository extends BaseRepository {
  constructor() {
    super('tasks');
  }

  async getTaskStats(query = {}) {
    const collection = this.getCollection();
    const total = await collection.countDocuments(query);
    const pending = await collection.countDocuments({ ...query, status: 'pending' });
    const inProgress = await collection.countDocuments({ ...query, status: 'in_progress' });
    const completed = await collection.countDocuments({ ...query, status: 'completed' });

    return {
      total,
      pending,
      inProgress,
      completed
    };
  }

  async getUserStats(query = {}) {
    const usersCollection = this.getCollection().db.collection('users');
    const total = await usersCollection.countDocuments(query);
    const admins = await usersCollection.countDocuments({ ...query, role: 'admin' });
    const regularUsers = await usersCollection.countDocuments({ ...query, role: 'user' });

    return {
      total,
      admins,
      regularUsers
    };
  }

  async getAdminStats() {
    const taskStats = await this.getTaskStats();
    const userStats = await this.getUserStats();

    return {
      tasks: {
        total: taskStats.total,
        pending: taskStats.pending,
        in_progress: taskStats.inProgress,
        completed: taskStats.completed
      },
      users: {
        total: userStats.total,
        admins: userStats.admins,
        regularUsers: userStats.regularUsers
      }
    };
  }

  async getUserSpecificStats(userId) {
    let userObjectId = userId;
    if (typeof userId === 'string' && userId.length === 24) {
      userObjectId = this.validateObjectId(userId) || userId;
    }

    const tasksCollection = this.getCollection();
    const userTasks = await tasksCollection.find({ assignedTo: userObjectId }).toArray();

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

  async getTaskStatsCounts(query = {}) {
    const collection = this.getCollection();
    
    return {
      all: await collection.countDocuments(query),
      pending: await collection.countDocuments({ ...query, status: 'pending' }),
      in_progress: await collection.countDocuments({ ...query, status: 'in_progress' }),
      completed: await collection.countDocuments({ ...query, status: 'completed' })
    };
  }
}
