import { ObjectId } from 'mongodb';
import { getDB } from '../config/db.js';

export class User {
  static async findAll() {
    const db = getDB();
    return await db.collection('users')
      .find({})
      .project({ password: 0 })
      .toArray();
  }

  static async findById(id) {
    const db = getDB();
    if (!ObjectId.isValid(id)) return null;
    
    return await db.collection('users').findOne(
      { _id: new ObjectId(id) },
      { projection: { password: 0 } }
    );
  }

  static async findByEmail(email) {
    const db = getDB();
    return await db.collection('users').findOne({ email });
  }

  static async updateById(id, updateData) {
    const db = getDB();
    if (!ObjectId.isValid(id)) return null;
    
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    return result.matchedCount > 0;
  }

  static async deleteById(id) {
    const db = getDB();
    if (!ObjectId.isValid(id)) return null;
    
    const result = await db.collection('users').deleteOne({
      _id: new ObjectId(id)
    });
    
    return result.deletedCount > 0;
  }

  static async deleteTasksByUser(id) {
    const db = getDB();
    if (!ObjectId.isValid(id)) return null;
    
    await db.collection('tasks').deleteMany({
      assignedTo: new ObjectId(id)
    });
  }
}
