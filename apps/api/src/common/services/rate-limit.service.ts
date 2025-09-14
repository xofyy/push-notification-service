import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import {
  RateLimitConfig,
  RateLimitResult,
  RateLimitInfo,
  RateLimitType,
} from '../interfaces/rate-limit.interface';

@Injectable()
export class RateLimitService {
  private readonly logger = new Logger(RateLimitService.name);
  private redis: Redis;

  constructor(private configService: ConfigService) {
    // Use Redis configuration from config service
    const redisUrl =
      this.configService.get('redis.local.url') ||
      this.configService.get('REDIS_URL') ||
      'redis://localhost:6379';

    this.redis = new Redis(redisUrl);
  }

  /**
   * Check if a request is within rate limits
   * @param key - Unique identifier for the rate limit (e.g., project:123, ip:192.168.1.1)
   * @param config - Rate limit configuration
   * @returns Rate limit result with allowed status and info
   */
  async checkRateLimit(
    key: string,
    config: RateLimitConfig,
  ): Promise<RateLimitResult> {
    const now = Date.now();
    const window = Math.floor(now / (config.windowMs * 1000));
    const redisKey = `rate_limit:${key}:${window}`;

    try {
      // Use Redis pipeline for atomic operations
      const pipeline = this.redis.pipeline();
      pipeline.incr(redisKey);
      pipeline.expire(redisKey, config.windowMs);
      pipeline.ttl(redisKey);

      const results = await pipeline.exec();
      if (!results) {
        throw new Error('Redis pipeline failed');
      }
      const count = results[0][1] as number;
      const ttl = results[2][1] as number;

      const resetTime = now + ttl * 1000;
      const remaining = Math.max(0, config.limit - count);
      const allowed = count <= config.limit;

      const info: RateLimitInfo = {
        limit: config.limit,
        remaining,
        resetTime,
        windowMs: config.windowMs,
      };

      return {
        allowed,
        info,
        message: allowed ? undefined : config.message || 'Rate limit exceeded',
      };
    } catch (error) {
      this.logger.error(`Rate limit check failed for key ${key}:`, error);
      // On Redis failure, allow the request but log the error
      return {
        allowed: true,
        info: {
          limit: config.limit,
          remaining: config.limit,
          resetTime: now + config.windowMs * 1000,
          windowMs: config.windowMs,
        },
      };
    }
  }

  /**
   * Generate a rate limit key based on type and identifiers
   * @param type - Type of rate limit
   * @param identifiers - Map of identifier keys and values
   * @returns Formatted rate limit key
   */
  generateKey(
    type: RateLimitType,
    identifiers: Record<string, string>,
  ): string {
    const parts = [type as string];

    Object.entries(identifiers).forEach(([key, value]) => {
      parts.push(`${key}:${value}`);
    });

    return parts.join(':');
  }

  /**
   * Get current rate limit status without incrementing counter
   * @param key - Rate limit key
   * @param config - Rate limit configuration
   * @returns Current rate limit info
   */
  async getRateLimitStatus(
    key: string,
    config: RateLimitConfig,
  ): Promise<RateLimitInfo> {
    const now = Date.now();
    const window = Math.floor(now / (config.windowMs * 1000));
    const redisKey = `rate_limit:${key}:${window}`;

    try {
      const [count, ttl] = await Promise.all([
        this.redis.get(redisKey).then((val) => parseInt(val || '0', 10)),
        this.redis.ttl(redisKey),
      ]);

      const resetTime = now + ttl * 1000;
      const remaining = Math.max(0, config.limit - count);

      return {
        limit: config.limit,
        remaining,
        resetTime,
        windowMs: config.windowMs,
      };
    } catch (error) {
      this.logger.error(
        `Failed to get rate limit status for key ${key}:`,
        error,
      );
      return {
        limit: config.limit,
        remaining: config.limit,
        resetTime: now + config.windowMs * 1000,
        windowMs: config.windowMs,
      };
    }
  }

  /**
   * Reset rate limit for a specific key
   * @param key - Rate limit key to reset
   */
  async resetRateLimit(key: string): Promise<void> {
    try {
      const pattern = `rate_limit:${key}:*`;
      const keys = await this.redis.keys(pattern);

      if (keys.length > 0) {
        await this.redis.del(...keys);
        this.logger.log(`Reset rate limit for key: ${key}`);
      }
    } catch (error) {
      this.logger.error(`Failed to reset rate limit for key ${key}:`, error);
    }
  }

  /**
   * Get all rate limit keys matching a pattern
   * @param pattern - Redis key pattern
   * @returns Array of matching keys with their values
   */
  async getRateLimitKeys(
    pattern: string,
  ): Promise<Array<{ key: string; count: number; ttl: number }>> {
    try {
      const keys = await this.redis.keys(`rate_limit:${pattern}`);
      const results = [];

      for (const key of keys) {
        const [count, ttl] = await Promise.all([
          this.redis.get(key).then((val) => parseInt(val || '0', 10)),
          this.redis.ttl(key),
        ]);

        results.push({ key, count, ttl });
      }

      return results;
    } catch (error) {
      this.logger.error(
        `Failed to get rate limit keys for pattern ${pattern}:`,
        error,
      );
      return [];
    }
  }
}
