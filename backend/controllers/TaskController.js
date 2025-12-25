import { Task } from '../models/Task.js';
import { ObjectId } from 'mongodb';
import { getDB } from '../config/db.js';

export class TaskController {
  static async createTask(req, res) {
    try {
      const { title, description, assignedTo, dueDate } = req.body;

      if (!title || !description || !assignedTo) {
        return res.status(400).json({ message: 'Title, description and assignedTo are required' });
      }

      const db = getDB();

      if (!ObjectId.isValid(assignedTo)) {
        return res.status(400).json({ message: 'Invalid user ID format' });
      }

      const user = await db.collection('users').findOne({ _id: new ObjectId(assignedTo) });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const newTask = {
        title,
        description,
        status: 'pending',
        assignedTo: new ObjectId(assignedTo),
        createdBy: req.user._id,
        createdAt: new Date()
      };

      if (dueDate) {
        newTask.dueDate = new Date(dueDate);
      }

      const task = await Task.create(newTask);

      res.status(201).json({
        message: 'Task created successfully',
        taskId: task._id,
        task
      });

    } catch (error) {
      console.error('Create task error:', error);
      res.status(500).json({
        message: 'Error creating task',
        error: error.message
      });
    }
  }

  static async getTasks(req, res) {
    try {
      const db = getDB();
      const currentUser = req.user;
      const isAdmin = currentUser.role === 'admin';

      let query = {};

      if (!isAdmin) {
        query.assignedTo = currentUser._id;
      }

      if (req.query.status) {
        query.status = req.query.status;
      }

      if (req.query.search) {
        query.$or = [
          { title: { $regex: req.query.search, $options: 'i' } },
          { description: { $regex: req.query.search, $options: 'i' } }
        ];
      }

      if (isAdmin && req.query.assignedTo) {
        if (ObjectId.isValid(req.query.assignedTo)) {
          query.assignedTo = new ObjectId(req.query.assignedTo);
        }
      }

      const sortField = req.query.sort || 'createdAt';
      const sortOrder = req.query.order === 'desc' ? -1 : 1;

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const tasks = await Task.findAll(query, { [sortField]: sortOrder }, skip, limit);

      const total = await Task.countDocuments(query);

      res.status(200).json({
        message: 'Tasks retrieved successfully',
        count: tasks.length,
        tasks: tasks,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalTasks: total,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1
        },
        filters: {
          status: req.query.status || 'all',
          assignedTo: req.query.assignedTo || 'all',
          sortBy: sortField,
          order: req.query.order || 'asc'
        }
      });

    } catch (error) {
      console.error('Get tasks error:', error);
      res.status(500).json({
        message: 'Error retrieving tasks',
        error: error.message
      });
    }
  }

  static async updateTask(req, res) {
    try {
      const db = getDB();
      const { id } = req.params;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid task ID format' });
      }

      const task = await Task.findById(id);
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      const currentUser = req.user;
      const isAdmin = currentUser.role === 'admin';

      if (!isAdmin && task.assignedTo.toString() !== currentUser._id.toString()) {
        return res.status(403).json({ message: 'Access denied. You can only update your own tasks' });
      }

      const { title, description, status, assignedTo, dueDate } = req.body;

      if (!isAdmin) {
        const updates = Object.keys(req.body);
        const allowedFields = ['status'];
        const hasDisallowedFields = updates.some(field => !allowedFields.includes(field));

        if (hasDisallowedFields) {
          return res.status(403).json({ message: 'Users can only update task status' });
        }
      }

      if (status && !['pending', 'in_progress', 'completed'].includes(status)) {
        return res.status(400).json({ message: 'Status must be pending, in_progress or completed' });
      }

      if (assignedTo && typeof assignedTo === 'string' && assignedTo.trim() !== '') {
        if (!ObjectId.isValid(assignedTo)) {
          return res.status(400).json({ message: 'Invalid user ID format' });
        }

        const user = await db.collection('users').findOne({ _id: new ObjectId(assignedTo) });
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
      }

      const updateFields = {};

      if (isAdmin) {
        if (title) updateFields.title = title;
        if (description) updateFields.description = description;
        if (assignedTo && typeof assignedTo === 'string' && assignedTo.trim() !== '') updateFields.assignedTo = new ObjectId(assignedTo);
        if (dueDate) updateFields.dueDate = new Date(dueDate);
      }

      if (status) updateFields.status = status;
      updateFields.updatedAt = new Date();

      const updated = await Task.updateById(id, updateFields);
      if (!updated) {
        return res.status(404).json({ message: 'Task not found' });
      }

      const updatedTask = await Task.findById(id);

      res.status(200).json({
        message: 'Task updated successfully',
        task: updatedTask
      });

    } catch (error) {
      console.error('Update task error:', error);
      res.status(500).json({
        message: 'Error updating task',
        error: error.message
      });
    }
  }

  static async deleteTask(req, res) {
    try {
      const { id } = req.params;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid task ID format' });
      }

      const deleted = await Task.deleteById(id);
      if (!deleted) {
        return res.status(404).json({ message: 'Task not found' });
      }

      res.status(200).json({
        message: 'Task deleted successfully',
        deletedTaskId: id
      });

    } catch (error) {
      console.error('Delete task error:', error);
      res.status(500).json({
        message: 'Error deleting task',
        error: error.message
      });
    }
  }
}
