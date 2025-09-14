import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from '@upstash/redis';
import IORedis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private upstashClient: Redis | null = null;
  private ioredisClient: IORedis | null = null;
  private useUpstash = false;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    try {
      // Try Upstash first if URL is available
      const upstashUrl = this.configService.get('redis.upstash.url');
      const upstashToken = this.configService.get('redis.upstash.token');

      if (upstashUrl && upstashToken) {
        this.logger.log('🔄 Connecting to Upstash Redis...');
        this.upstashClient = new Redis({
          url: upstashUrl,
          token: upstashToken,
        });

        // Test the connection
        try {
          await this.upstashClient.ping();
          this.useUpstash = true;
          this.logger.log('✅ Connected to Upstash Redis successfully');
        } catch (error) {
          const errorObj =
            error instanceof Error ? error : new Error(String(error));
          this.logger.warn(`⚠️ Upstash connection failed: ${errorObj.message}`);
          this.logger.log('🔄 Falling back to local Redis...');
          this.upstashClient = null;
        }
      }

      // Only attempt local Redis if Upstash connection failed
      if (!this.useUpstash) {
        const localUrl = this.configService.get('redis.local.url');

        // Skip local Redis if it's the default localhost URL and we don't have a local server
        if (localUrl === 'redis://localhost:6379') {
          this.logger.log(
            '📝 Skipping local Redis connection (localhost not available)',
          );
          this.logger.log(
            '📝 Redis is optional - continuing without local cache',
          );
          return;
        }

        this.ioredisClient = new IORedis(localUrl, {
          maxRetriesPerRequest: 3,
          lazyConnect: true,
          connectTimeout: 5000,
        });

        try {
          await this.ioredisClient.ping();
          this.logger.log('✅ Connected to local Redis successfully');
        } catch (error) {
          const errorObj =
            error instanceof Error ? error : new Error(String(error));
          this.logger.warn(
            `⚠️ Local Redis connection failed: ${errorObj.message}`,
          );
          this.logger.log('📝 Redis is optional - continuing without cache');
          this.ioredisClient = null;
        }
      }
    } catch (error) {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      this.logger.error(`❌ Redis initialization failed: ${errorObj.message}`);
    }
  }

  async onModuleDestroy() {
    if (this.ioredisClient) {
      await this.ioredisClient.quit();
      this.logger.log('🔌 Disconnected from Redis');
    }
  }

  // Unified Redis operations
  async get(key: string): Promise<string | null> {
    try {
      if (this.useUpstash && this.upstashClient) {
        return await this.upstashClient.get(key);
      } else if (this.ioredisClient) {
        return await this.ioredisClient.get(key);
      }
      return null;
    } catch (error) {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Redis GET error: ${errorObj.message}`);
      return null;
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<boolean> {
    try {
      if (this.useUpstash && this.upstashClient) {
        if (ttl) {
          await this.upstashClient.set(key, value, { ex: ttl });
        } else {
          await this.upstashClient.set(key, value);
        }
        return true;
      } else if (this.ioredisClient) {
        if (ttl) {
          await this.ioredisClient.setex(key, ttl, value);
        } else {
          await this.ioredisClient.set(key, value);
        }
        return true;
      }
      return false;
    } catch (error) {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Redis SET error: ${errorObj.message}`);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      if (this.useUpstash && this.upstashClient) {
        await this.upstashClient.del(key);
        return true;
      } else if (this.ioredisClient) {
        await this.ioredisClient.del(key);
        return true;
      }
      return false;
    } catch (error) {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Redis DEL error: ${errorObj.message}`);
      return false;
    }
  }

  async ping(): Promise<boolean> {
    try {
      if (this.useUpstash && this.upstashClient) {
        await this.upstashClient.ping();
        return true;
      } else if (this.ioredisClient) {
        await this.ioredisClient.ping();
        return true;
      }
      return false;
    } catch (error) {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Redis PING error: ${errorObj.message}`);
      return false;
    }
  }

  getConnectionInfo() {
    return {
      connected: this.useUpstash ? !!this.upstashClient : !!this.ioredisClient,
      type: this.useUpstash ? 'upstash' : this.ioredisClient ? 'local' : 'none',
      url: this.useUpstash
        ? this.configService.get('redis.upstash.url')
        : this.configService.get('redis.local.url'),
    };
  }
}
