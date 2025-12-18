import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import { verifyAdmin } from '../middleware/verifyAdmin.js';
import { getDB } from '../config/db.js';
import { ObjectId } from 'mongodb';


const router = express.Router();


router.post('/', verifyToken, verifyAdmin, async (req, res) => {
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

    const result = await db.collection('tasks').insertOne(newTask);

    res.status(201).json({
      message: 'Task created successfully',
      taskId: result.insertedId,
      task: {
        ...newTask,
        _id: result.insertedId
      }
    });

  } catch (error) {

    console.error('Create task error:', error);
    res.status(500).json({
      message: 'Error creating task',
      error: error.message
    });

  }
});

router.get('/', verifyToken, async (req, res) => {
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

    const tasks = await db.collection('tasks')
      .find(query)
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await db.collection('tasks').countDocuments(query);

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
});

router.get('/:id', verifyToken, async (req, res) => {
  try {

    const db = getDB();

    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid task ID format' });
    }

    const task = await db.collection('tasks').findOne({ _id: new ObjectId(id) });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const currentUser = req.user;
    const isAdmin = currentUser.role === 'admin';

    if (!isAdmin && task.assignedTo.toString() !== currentUser._id.toString()) {
      return res.status(403).json({ message: 'Access denied. You can only view your own tasks' });
    }

    res.status(200).json({
      message: 'Task retrieved successfully',
      task: task
    });

  } catch (error) {

    res.status(200).json({
      message: 'Task retrieved successfully',
      task: task
    });

  }
});

router.put('/:id', verifyToken, async (req, res) => {
  try {

    const db = getDB();

    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid task ID format' });
    }

    const task = await db.collection('tasks').findOne({ _id: new ObjectId(id) });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const currentUser = req.user;
    const isAdmin = currentUser.role === 'admin';

    if (!isAdmin && task.assignedTo.toString() !== currentUser._id.toString()) {
      return res.status(403).json({ message: 'Access denied. You can only update your own tasks' });
    }

    const { title, description, status, assignedTo, dueDate } = req.body;

    if (!isAdmin && (title || description || assignedTo || dueDate)) {
      return res.status(403).json({ message: 'Users can only update task status' });
    }

    if (status && !['pending', 'in_progress', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Status must be pending, in_progress or completed' });
    }

    if (assignedTo) {
      if (!ObjectId.isValid(assignedTo)) {
        return res.status(400).json({ message: 'Invalid user ID format' });
      }

      const user = await db.collection('users').findOne({ _id: new ObjectId(assignedTo) });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
    }

    const updateFields = {};

    if (title) updateFields.title = title;
    if (description) updateFields.description = description;
    if (status) updateFields.status = status;
    if (assignedTo) updateFields.assignedTo = new ObjectId(assignedTo);
    if (dueDate) updateFields.dueDate = new Date(dueDate);

    updateFields.updatedAt = new Date();

    const result = await db.collection('tasks').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const updatedTask = await db.collection('tasks').findOne({ _id: new ObjectId(id) });

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
});

router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {

    const db = getDB();

    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid task ID format' });
    }

    const result = await db.collection('tasks').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
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
});

export default router;