import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { RedisService } from './common/redis';
import { FCMService } from './providers/fcm';
import { APNsService } from './providers/apns';
import { WebPushService } from './providers/webpush';
import { NotificationService } from './providers/notification';

@Injectable()
export class AppService {
  constructor(
    private configService: ConfigService,
    @InjectConnection() private connection: Connection,
    private redisService: RedisService,
    private fcmService: FCMService,
    private apnsService: APNsService,
    private webPushService: WebPushService,
    private notificationService: NotificationService,
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
    const fcmStatus = this.fcmService.getStatus();
    const apnsStatus = this.apnsService.getStatus();
    const webPushStatus = this.webPushService.getStatus();
    const notificationStatus = this.notificationService.getServiceStatus();

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
      pushProviders: {
        fcm: {
          available: fcmStatus.available,
          projectId: fcmStatus.projectId,
        },
        apns: {
          available: apnsStatus.available,
          production: apnsStatus.production,
          topic: apnsStatus.topic,
        },
        webPush: {
          available: webPushStatus.available,
          publicKey: webPushStatus.publicKey,
          subject: webPushStatus.subject,
          canGenerateKeys: webPushStatus.canGenerateKeys,
        },
        unified: {
          available: notificationStatus.available,
          availablePlatforms: notificationStatus.availablePlatforms,
        },
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
