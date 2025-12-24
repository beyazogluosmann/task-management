import { StatsRepository } from '../repositories/StatsRepository.js';

const statsRepository = new StatsRepository();

export class Stats {
  static async getAdminStats() {
    return await statsRepository.getAdminStats();
  }

  static async getUserStats(userId) {
    return await statsRepository.getUserSpecificStats(userId);
  }
}
