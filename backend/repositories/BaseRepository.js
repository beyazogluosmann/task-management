import { ObjectId } from 'mongodb';
import { getDB } from '../config/db.js';

export class BaseRepository {
  constructor(collectionName) {
    this.collectionName = collectionName;
  }

  getCollection() {
    return getDB().collection(this.collectionName);
  }

  validateObjectId(id) {
    if (!ObjectId.isValid(id)) return null;
    return new ObjectId(id);
  }

  async findOne(query = {}, options = {}) {
    return await this.getCollection().findOne(query, options);
  }

  async findOneById(id, options = {}) {
    const objectId = this.validateObjectId(id);
    if (!objectId) return null;
    return await this.findOne({ _id: objectId }, options);
  }

  async findMany(query = {}, options = {}) {
    return await this.getCollection().find(query, options).toArray();
  }

  async insertOne(data) {
    const result = await this.getCollection().insertOne(data);
    return { _id: result.insertedId, ...data };
  }

  async updateOne(id, updateData) {
    const objectId = this.validateObjectId(id);
    if (!objectId) return null;
    
    const result = await this.getCollection().updateOne(
      { _id: objectId },
      { $set: updateData }
    );
    
    return result.matchedCount > 0;
  }

  async deleteOne(id) {
    const objectId = this.validateObjectId(id);
    if (!objectId) return null;
    
    const result = await this.getCollection().deleteOne({ _id: objectId });
    return result.deletedCount > 0;
  }

  async countDocuments(query = {}) {
    return await this.getCollection().countDocuments(query);
  }

  async aggregate(pipeline) {
    return await this.getCollection().aggregate(pipeline).toArray();
  }
}
