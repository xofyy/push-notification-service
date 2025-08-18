import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class AppService {
  constructor(
    private configService: ConfigService,
    @InjectConnection() private connection: Connection,
  ) {}

  getHealth() {
    const dbStatus = this.connection.readyState;
    const dbStatusMap: Record<number, string> = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };

    return {
      status: dbStatus === 1 ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      service: 'push-notification-service',
      version: '1.0.0',
      uptime: process.uptime(),
      environment: this.configService.get('environment'),
      database: {
        status: dbStatusMap[dbStatus] || 'unknown',
        name: this.connection.name,
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
