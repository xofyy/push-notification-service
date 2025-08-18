import { registerAs } from '@nestjs/config';
import { MongooseModuleOptions } from '@nestjs/mongoose';

export default registerAs('database', (): MongooseModuleOptions => ({
  uri: process.env.MONGODB_URI!,
  connectionFactory: (connection) => {
    connection.on('connected', () => {
      console.log('✅ Connected to MongoDB Atlas');
    });
    connection.on('disconnected', () => {
      console.log('❌ Disconnected from MongoDB Atlas');
    });
    connection.on('error', (error: any) => {
      console.error('❌ MongoDB Atlas connection error:', error);
    });
    return connection;
  },
  // Optimized for MongoDB Atlas M0 free tier (512MB limit)  
  serverSelectionTimeoutMS: 5000, // How long to try to connect
  socketTimeoutMS: 45000, // How long to wait for a response
  bufferCommands: false, // Disable mongoose buffering
}));