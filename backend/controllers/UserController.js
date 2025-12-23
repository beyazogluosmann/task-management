import { User } from '../models/User.js';
import { ObjectId } from 'mongodb';

export class UserController {
  static async getUsers(req, res) {
    try {
      const users = await User.findAll();

      res.status(200).json({
        message: 'Users retrieved successfully',
        count: users.length,
        users: users
      });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({
        message: 'Error retrieving users',
        error: error.message
      });
    }
  }

  static async getUser(req, res) {
    try {
      const { id } = req.params;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid user ID format' });
      }

      const user = await User.findById(id);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json({
        message: 'User retrieved successfully',
        user: user
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({
        message: 'Error retrieving user',
        error: error.message
      });
    }
  }

  static async updateUser(req, res) {
    try {
      const { id } = req.params;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid userID format' });
      }

      const currentUser = req.user;
      const isAdmin = currentUser.role === 'admin';
      const isOwnProfile = currentUser._id.toString() === id;

      if (!isAdmin && !isOwnProfile) {
        return res.status(403).json({ message: 'You can only update your own profile' });
      }

      const { name, email, role } = req.body;

      if (!name && !email && !role) {
        return res.status(400).json({ message: 'At liest one field (name,email,role) is required' });
      }

      if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return res.status(400).json({ message: 'Invalid email format' });
        }

        const existingUser = await User.findByEmail(email);
        if (existingUser && existingUser._id.toString() !== id) {
          return res.status(400).json({ message: 'This email is already in use' });
        }
      }

      if (role && !isAdmin) {
        return res.status(403).json({ message: 'Only admins can change user roles' });
      }

      if (role && !['admin', 'user'].includes(role)) {
        return res.status(400).json({ message: 'Role must be either "admin" or "user"' });
      }

      const updateFields = {};

      if (name) updateFields.name = name;
      if (email) updateFields.email = email;
      if (role) updateFields.role = role;

      updateFields.updatedAt = new Date();

      const updated = await User.updateById(id, updateFields);

      if (!updated) {
        return res.status(404).json({ message: 'User not found' });
      }

      const updatedUser = await User.findById(id);

      res.status(200).json({
        message: 'User updated successfully',
        user: updatedUser
      });

    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({
        message: 'Error updating user',
        error: error.message
      });
    }
  }

  static async deleteUser(req, res) {
    try {
      const { id } = req.params;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid user ID format' });
      }

      if (req.user._id.toString() === id) {
        return res.status(400).json({ message: 'You cannot delete your own account' });
      }

      await User.deleteTasksByUser(id);

      const deleted = await User.deleteById(id);

      if (!deleted) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json({
        message: 'User deleted successfully',
        deletedUserId: id
      });

    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({
        message: 'Error deleting user',
        error: error.message
      });
    }
  }
}
