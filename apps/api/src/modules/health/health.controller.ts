import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { RedisService } from '../../common/redis/redis.service';
import { FCMService } from '../../providers/fcm';
import { APNsService } from '../../providers/apns';
import { WebPushService } from '../../providers/webpush';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly redisService: RedisService,
    private readonly fcmService: FCMService,
    private readonly apnsService: APNsService,
    private readonly webPushService: WebPushService,
  ) {}
  @Get()
  @ApiOperation({
    summary: 'Health check',
    description:
      'Returns the health status of the Push Notification Service API.',
  })
  @ApiResponse({
    status: 200,
    description: 'Service is healthy',
    schema: {
      example: {
        status: 'ok',
        timestamp: '2023-12-07T17:00:00.000Z',
        uptime: 3600,
        environment: 'development',
        version: '1.0.0',
        services: {
          database: 'connected',
          redis: 'connected',
          fcm: 'configured',
          apns: 'not_configured',
          webPush: 'configured',
        },
        memory: {
          used: '45.2 MB',
          total: '512 MB',
          percentage: 8.8,
        },
      },
    },
  })
  async getHealth() {
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();

    const mongoState = this.connection?.readyState;
    const redisOk = await this.redisService.ping().catch(() => false);
    const fcm = this.fcmService.getStatus();
    const apns = this.apnsService.getStatus();
    const webpush = this.webPushService.getStatus();

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(uptime),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      services: {
        database: mongoState === 1 ? 'connected' : mongoState === 2 ? 'connecting' : 'disconnected',
        redis: redisOk ? 'connected' : 'disconnected',
        fcm: fcm.available ? 'configured' : 'not_configured',
        apns: apns.available ? 'configured' : 'not_configured',
        webPush: webpush.available ? 'configured' : 'not_configured',
      },
      memory: {
        used: `${Math.round((memoryUsage.heapUsed / 1024 / 1024) * 100) / 100} MB`,
        total: `${Math.round((memoryUsage.heapTotal / 1024 / 1024) * 100) / 100} MB`,
        percentage:
          Math.round(
            (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100 * 100,
          ) / 100,
      },
    };
  }

  @Get('ping')
  @ApiOperation({
    summary: 'Ping endpoint',
    description: 'Simple ping endpoint for basic connectivity testing.',
  })
  @ApiResponse({
    status: 200,
    description: 'Pong response',
    schema: {
      example: {
        message: 'pong',
        timestamp: '2023-12-07T17:00:00.000Z',
      },
    },
  })
  ping() {
    return {
      message: 'pong',
      timestamp: new Date().toISOString(),
    };
  }
}
