import { UserRepository } from '../repositories/UserRepository.js';

const userRepository = new UserRepository();

export class User {
  static async findAll() {
    return await userRepository.findAll();
  }

  static async findById(id) {
    return await userRepository.findById(id);
  }

  static async findByEmail(email) {
    return await userRepository.findByEmail(email);
  }

  static async updateById(id, updateData) {
    return await userRepository.updateById(id, updateData);
  }

  static async deleteById(id) {
    return await userRepository.deleteById(id);
  }

  static async deleteTasksByUser(id) {
    return await userRepository.deleteTasksByUser(id);
  }
}
