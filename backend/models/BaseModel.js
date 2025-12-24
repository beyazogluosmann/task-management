import { getDB } from '../config/db.js';
import { ObjectId } from 'mongodb';

export class BaseModel {
  static getDB() {
    return getDB();
  }

  static getCollection(name) {
    return this.getDB().collection(name);
  }

  static validateObjectId(id) {
    if (!ObjectId.isValid(id)) return null;
    return new ObjectId(id);
  }
}
