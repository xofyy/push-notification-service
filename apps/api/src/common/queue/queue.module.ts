import { Module, DynamicModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { QueueService } from './queue.service';
import { NotificationProcessor } from './processors/notification.processor';
import { ScheduledNotificationProcessor } from './processors/scheduled-notification.processor';
import { BatchNotificationProcessor } from './processors/batch-notification.processor';
import { RecurringNotificationProcessor } from './processors/recurring-notification.processor';
import { NotificationModule } from '../../providers/notification/notification.module';

@Module({})
export class QueueModule {
  static forRoot(): DynamicModule {
    console.log('🔧 Configuring Queue Module...');
    
    return {
      module: QueueModule,
      imports: [
        ConfigModule,
        NotificationModule,
        {
          module: class QueueConfigurationModule {},
          imports: [ConfigModule],
          providers: [
            {
              provide: 'QUEUE_CONFIG',
              useFactory: async (configService: ConfigService) => {
                const queueEnabled = configService.get('ENABLE_QUEUE_SYSTEM', 'true') !== 'false';
                console.log(`🔍 Queue system enabled: ${queueEnabled}`);
                
                if (!queueEnabled) {
                  console.log('📝 Queue system disabled via ENABLE_QUEUE_SYSTEM=false');
                  console.log('📝 No Redis connections will be made');
                  return { enabled: false };
                }
                
                const redisUrl = configService.get('UPSTASH_REDIS_URL');
                const redisToken = configService.get('UPSTASH_REDIS_TOKEN');
                
                if (!redisUrl || !redisToken) {
                  console.log('⚠️ UPSTASH_REDIS_URL or UPSTASH_REDIS_TOKEN not configured');
                  console.log('📝 Queue system will be disabled');
                  return { enabled: false };
                }
                
                // Test Redis connectivity when enabled
                try {
                  const { Redis } = await import('@upstash/redis');
                  const testClient = new Redis({
                    url: redisUrl,
                    token: redisToken,
                  });
                  
                  await testClient.ping();
                  console.log('✅ Queue system enabled - Upstash Redis connectivity verified');
                  console.log('📝 Ready for BullMQ integration - no Redis connection errors!');
                  
                  return { 
                    enabled: true,
                    redisUrl,
                    redisToken
                  };
                } catch (error) {
                  console.error('❌ Queue system disabled - Redis connectivity failed:', error.message);
                  console.log('📝 Falling back to disabled mode');
                  return { enabled: false };
                }
              },
              inject: [ConfigService],
            },
          ],
          exports: ['QUEUE_CONFIG'],
        },
      ],
      providers: [
        QueueService,
        NotificationProcessor,
        ScheduledNotificationProcessor,
        BatchNotificationProcessor,
        RecurringNotificationProcessor,
      ],
      exports: [QueueService],
    };
  }
}