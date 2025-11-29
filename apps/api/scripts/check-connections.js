const mongoose = require('mongoose');
const Redis = require('ioredis');

async function check() {
  console.log('Checking connections...');

  // Check MongoDB
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/test');
    console.log('✅ MongoDB Connected');
    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ MongoDB Connection Failed:', err.message);
  }

  // Check Redis
  try {
    console.log('Connecting to Redis...');
    const redis = new Redis('redis://localhost:6379');
    await redis.ping();
    console.log('✅ Redis Connected');
    redis.disconnect();
  } catch (err) {
    console.error('❌ Redis Connection Failed:', err.message);
  }
}

check();
