import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import IORedis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private ioredisClient: IORedis | null = null;

  constructor(private configService: ConfigService) { }

  async onModuleInit() {
    try {
      const localUrl = this.configService.get('redis.local.url');

      this.ioredisClient = new IORedis(localUrl, {
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        connectTimeout: 5000,
      });

      try {
        await this.ioredisClient.ping();
        this.logger.log('Connected to local Redis successfully');
      } catch (error) {
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        this.logger.warn(
          `Local Redis connection failed: ${errorObj.message}`,
        );
        this.logger.log('Redis is optional - continuing without cache');
        this.ioredisClient = null;
      }
    } catch (error) {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Redis initialization failed: ${errorObj.message}`);
    }
  }

  async onModuleDestroy() {
    if (this.ioredisClient) {
      await this.ioredisClient.quit();
      this.logger.log('Disconnected from Redis');
    }
  }

  // Unified Redis operations
  async get(key: string): Promise<string | null> {
    try {
      if (this.ioredisClient) {
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
      if (this.ioredisClient) {
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
      if (this.ioredisClient) {
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
      if (this.ioredisClient) {
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
      connected: !!this.ioredisClient,
      type: this.ioredisClient ? 'local' : 'none',
      url: this.configService.get('redis.local.url'),
    };
  }
}
