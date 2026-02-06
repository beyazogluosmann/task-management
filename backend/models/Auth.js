import { AuthRepository } from '../repositories/AuthRepository.js';

const authRepository = new AuthRepository();

export class Auth {
  static async findUserByEmail(email) {
    return await authRepository.findByEmail(email);
  }

  static async createUser(userData) {
    return await authRepository.insertOne(userData);
  }

  static async findUserById(userId) {
    return await authRepository.findOneById(userId);
  }

  static async updateResetToken(userId, resetToken, resetTokenExpiry) {
    return await authRepository.updateResetToken(userId, resetToken, resetTokenExpiry);
  }

  static async findUserByResetToken(token) {
    return await authRepository.findByResetToken(token);
  }

  static async updatePassword(userId, hashedPassword) {
    return await authRepository.updatePassword(userId, hashedPassword);
  }
}
