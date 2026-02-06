import { TaskRepository } from '../repositories/TaskRepository.js';

const taskRepository = new TaskRepository();

export class Task {
  static async create(taskData) {
    return await taskRepository.create(taskData);
  }

  static async findAll(query, sort, skip, limit) {
    return await taskRepository.findAll(query, sort, skip, limit);
  }

  static async countDocuments(query) {
    return await taskRepository.countDocuments(query);
  }

  static async findById(id) {
    return await taskRepository.findById(id);
  }

  static async updateById(id, updateData) {
    return await taskRepository.updateById(id, updateData);
  }

  static async deleteById(id) {
    return await taskRepository.deleteById(id);
  }
}
