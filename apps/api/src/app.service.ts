import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { RedisService } from './common/redis';

@Injectable()
export class AppService {
  constructor(
    private configService: ConfigService,
    @InjectConnection() private connection: Connection,
    private redisService: RedisService,
  ) {}

  async getHealth() {
    const dbStatus = this.connection.readyState;
    const dbStatusMap: Record<number, string> = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };

    const redisInfo = this.redisService.getConnectionInfo();
    const redisConnected = await this.redisService.ping();

    const overallStatus = dbStatus === 1 && redisConnected ? 'ok' : 'degraded';

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      service: 'push-notification-service',
      version: '1.0.0',
      uptime: process.uptime(),
      environment: this.configService.get('environment'),
      database: {
        status: dbStatusMap[dbStatus] || 'unknown',
        name: this.connection.name,
      },
      redis: {
        status: redisConnected ? 'connected' : 'disconnected',
        type: redisInfo.type,
        connected: redisInfo.connected,
      },
      features: {
        webhooks: this.configService.get('features.webhooks'),
        analytics: this.configService.get('features.analytics'),
        scheduling: this.configService.get('features.scheduling'),
      },
    };
  }

  getInfo() {
    return {
      name: 'Push Notification Service',
      description: 'Enterprise-level push notification system',
      version: '1.0.0',
      environment: this.configService.get('environment'),
      endpoints: {
        health: '/api/v1/health',
        docs: '/api/v1/docs',
      },
      features: {
        webhooks: this.configService.get('features.webhooks'),
        analytics: this.configService.get('features.analytics'),
        scheduling: this.configService.get('features.scheduling'),
      },
    };
  }
}
