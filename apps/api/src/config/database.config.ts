import { registerAs } from '@nestjs/config';
import { MongooseModuleOptions } from '@nestjs/mongoose';
import { Logger } from '@nestjs/common';

export default registerAs(
  'database',
  (): MongooseModuleOptions => ({
    uri: process.env.MONGODB_URI!,
    connectionFactory: (connection) => {
      const logger = new Logger('DatabaseModule');
      connection.on('connected', () => {
        logger.log('Connected to MongoDB');
      });
      connection.on('disconnected', () => {
        logger.log('Disconnected from MongoDB');
      });
      connection.on('error', (error: any) => {
        logger.error('MongoDB connection error:', error);
      });
      return connection;
    },
    // Optimized for local development
    serverSelectionTimeoutMS: 5000, // How long to try to connect
    socketTimeoutMS: 45000, // How long to wait for a response
    bufferCommands: false, // Disable mongoose buffering
    directConnection: true, // Force direct connection to avoid Docker hostname issues
  }),
);
