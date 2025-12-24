import { BaseRepository } from './BaseRepository.js';

export class AuthRepository extends BaseRepository {
  constructor() {
    super('users');
  }

  async findByEmail(email) {
    return await this.findOne({ email });
  }

  async findByResetToken(token) {
    return await this.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() }
    });
  }

  async updateResetToken(userId, resetToken, resetTokenExpiry) {
    const objectId = this.validateObjectId(userId);
    if (!objectId) return null;
    
    const result = await this.getCollection().updateOne(
      { _id: objectId },
      {
        $set: { resetToken, resetTokenExpiry }
      }
    );
    
    return result.matchedCount > 0;
  }

  async updatePassword(userId, hashedPassword) {
    const objectId = this.validateObjectId(userId);
    if (!objectId) return null;
    
    const result = await this.getCollection().updateOne(
      { _id: objectId },
      {
        $set: { password: hashedPassword },
        $unset: { resetToken: '', resetTokenExpiry: '' }
      }
    );
    
    return result.matchedCount > 0;
  }
}
