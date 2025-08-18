import { registerAs } from '@nestjs/config';

export default registerAs('redis', () => ({
  upstash: {
    url: process.env.UPSTASH_REDIS_URL,
    token: process.env.UPSTASH_REDIS_TOKEN,
  },
  // Fallback to local Redis for development
  local: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  // Configuration optimized for Upstash free tier (10K commands/day)
  options: {
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    keepAlive: 30000,
  },
}));