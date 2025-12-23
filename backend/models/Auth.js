import { getDB } from '../config/db.js';
import { ObjectId } from 'mongodb';

export class Auth {
  static async findUserByEmail(email) {
    const db = getDB();
    return await db.collection('users').findOne({ email });
  }

  static async createUser(userData) {
    const db = getDB();
    const result = await db.collection('users').insertOne(userData);
    return { _id: result.insertedId, ...userData };
  }

  static async findUserById(userId) {
    const db = getDB();
    if (!ObjectId.isValid(userId)) return null;
    return await db.collection('users').findOne({ _id: new ObjectId(userId) });
  }

  static async updateResetToken(userId, resetToken, resetTokenExpiry) {
    const db = getDB();
    await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          resetToken,
          resetTokenExpiry
        }
      }
    );
  }

  static async findUserByResetToken(token) {
    const db = getDB();
    return await db.collection('users').findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() }
    });
  }

  static async updatePassword(userId, hashedPassword) {
    const db = getDB();
    await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: { password: hashedPassword },
        $unset: { resetToken: '', resetTokenExpiry: '' }
      }
    );
  }
}
