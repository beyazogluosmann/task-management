import { BaseRepository } from './BaseRepository.js';

export class UserRepository extends BaseRepository {
  constructor() {
    super('users');
  }

  async findAll() {
    return await this.findMany({}, { projection: { password: 0 } });
  }

  async findById(id) {
    return await this.findOneById(id, { projection: { password: 0 } });
  }

  async findByEmail(email) {
    return await this.findOne({ email });
  }

  async updateById(id, updateData) {
    return await this.updateOne(id, updateData);
  }

  async deleteById(id) {
    return await this.deleteOne(id);
  }

  async deleteTasksByUser(id) {
    const objectId = this.validateObjectId(id);
    if (!objectId) return null;

    const tasksCollection = this.getCollection().db.collection('tasks');
    const result = await tasksCollection.deleteMany({
      assignedTo: objectId
    });

    return result.deletedCount;
  }
}
