import { BaseRepository } from './BaseRepository.js';

export class TaskRepository extends BaseRepository {
  constructor() {
    super('tasks');
  }

  buildAggregationPipeline(matchStage, additionalStages = []) {
    return [
      { $match: matchStage },
      {
        $lookup: {
          from: 'users',
          localField: 'assignedTo',
          foreignField: '_id',
          as: 'assignedTo'
        }
      },
      { $unwind: { path: '$assignedTo', preserveNullAndEmptyArrays: true } },
      ...additionalStages
    ];
  }

  async create(taskData) {
    return await this.insertOne(taskData);
  }

  async findAll(query, sort, skip, limit) {
    const pipeline = this.buildAggregationPipeline(query, [
      { $sort: sort },
      { $skip: skip },
      { $limit: limit }
    ]);
    
    return await this.aggregate(pipeline);
  }

  async findById(id) {
    const objectId = this.validateObjectId(id);
    if (!objectId) return null;
    
    const pipeline = this.buildAggregationPipeline({ _id: objectId });
    const tasks = await this.aggregate(pipeline);
    
    return tasks[0] || null;
  }

  async updateById(id, updateData) {
    return await this.updateOne(id, updateData);
  }

  async deleteById(id) {
    return await this.deleteOne(id);
  }

  async countDocuments(query) {
    return await this.getCollection().countDocuments(query);
  }
}
