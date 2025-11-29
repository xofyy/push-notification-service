import { Module, DynamicModule, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DevicesModule } from '../../modules/devices/devices.module';
import { AnalyticsModule } from '../../modules/analytics/analytics.module';
import { WebhooksModule } from '../../modules/webhooks/webhooks.module';
import { MongooseModule } from '@nestjs/mongoose';
import { WebhookDelivery, WebhookDeliverySchema } from '../../modules/webhooks/schemas/webhook-delivery.schema';
import { QueueService } from './queue.service';
import { NotificationProcessor } from './processors/notification.processor';
import { ScheduledNotificationProcessor } from './processors/scheduled-notification.processor';
import { BatchNotificationProcessor } from './processors/batch-notification.processor';
import { RecurringNotificationProcessor } from './processors/recurring-notification.processor';
import { WebhookProcessor } from './processors/webhook.processor';
import { NotificationModule } from '../../providers/notification/notification.module';

@Global()
@Module({})
export class QueueModule {
  static forRoot(): DynamicModule {
    console.log('Configuring Queue Module...');

    // Decide whether to enable BullMQ based on environment
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

    const imports: any[] = [
      ConfigModule,
      NotificationModule,
      DevicesModule,
      AnalyticsModule,
      WebhooksModule,
      MongooseModule.forFeature([
        { name: WebhookDelivery.name, schema: WebhookDeliverySchema },
      ]),
    ];

    imports.push(
      BullModule.forRootAsync({
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => {
          const redisUrl = configService.get<string>('redis.local.url') || configService.get<string>('redis.upstash.url');
          if (!redisUrl) {
            throw new Error('Redis URL not configured');
          }
          const url = new URL(redisUrl);
          const isTls = url.protocol === 'rediss:';
          const connection: any = {
            host: url.hostname,
            port: url.port ? parseInt(url.port, 10) : 6379,
          };
          if (url.password) connection.password = url.password;
          if (isTls) connection.tls = {};
          return { connection };
        },
        inject: [ConfigService],
      }),
      BullModule.registerQueue(
        { name: 'notification-queue' },
        { name: 'scheduled-queue' },
        { name: 'batch-queue' },
        { name: 'recurring-queue' },
        { name: 'webhook-queue' },
      ),
    );
    console.log('BullMQ configured for queues');

    return {
      module: QueueModule,
      imports,
      providers: [
        QueueService,
        NotificationProcessor,
        ScheduledNotificationProcessor,
        BatchNotificationProcessor,
        RecurringNotificationProcessor,
        WebhookProcessor,
      ],
      exports: [QueueService],
    };
  }
}
