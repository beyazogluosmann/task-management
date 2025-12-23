import { ObjectId } from 'mongodb';
import { getDB } from '../config/db.js';

export class Task {
  static async create(taskData) {
    const db = getDB();
    const result = await db.collection('tasks').insertOne(taskData);
    return { _id: result.insertedId, ...taskData };
  }

  static async findAll(query, sort, skip, limit) {
    const db = getDB();
    const tasks = await db.collection('tasks')
      .find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray();
    
    return tasks;
  }

  static async countDocuments(query) {
    const db = getDB();
    return await db.collection('tasks').countDocuments(query);
  }

  static async findById(id) {
    const db = getDB();
    if (!ObjectId.isValid(id)) return null;
    return await db.collection('tasks').findOne({ _id: new ObjectId(id) });
  }

  static async updateById(id, updateData) {
    const db = getDB();
    if (!ObjectId.isValid(id)) return null;
    
    const result = await db.collection('tasks').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    return result.matchedCount > 0;
  }

  static async deleteById(id) {
    const db = getDB();
    if (!ObjectId.isValid(id)) return null;
    
    const result = await db.collection('tasks').deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }

  static async populateAssignee(task) {
    if (!task?.assignedTo) return task;
    
    const db = getDB();
    const assignee = await db.collection('users').findOne(
      { _id: task.assignedTo },
      { projection: { name: 1, email: 1 } }
    );
    
    return { ...task, assignedTo: assignee || task.assignedTo };
  }

  static async populateAssignees(tasks) {
    return Promise.all(tasks.map(task => this.populateAssignee(task)));
  }
}
