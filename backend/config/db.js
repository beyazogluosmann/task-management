import { MongoClient } from 'mongodb';

let db;

const connectDB = async () => {
    try {
    const client = await MongoClient.connect(process.env.MONGODB_URI)
    db = client.db();
    console.log('MongoDB conencted successfully')    
    } catch (error) {
      console.error('MongoDB connect',error.message);
      process.exit(1);
    }
};

const getDB = () => {
    if(!db){
      throw new Error('No connected Database');
    }
    return db;
};

export { connectDB, getDB };
