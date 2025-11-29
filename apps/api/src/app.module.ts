import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/configuration';
import databaseConfig from './config/database.config';
import redisConfig from './config/redis.config';
import fcmConfig from './config/fcm.config';
import { envValidationSchema } from './config/env.validation';
import { RedisModule } from './common/redis';
import { CommonModule } from './common/common.module';
import { QueueModule } from './common/queue/queue.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { DevicesModule } from './modules/devices/devices.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { TemplatesModule } from './modules/templates/templates.module';
import { QueuesModule } from './modules/queues/queues.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AdminModule } from './modules/admin/admin.module';
import { HealthModule } from './modules/health/health.module';
import { FCMModule } from './providers/fcm/fcm.module';
import { APNsModule } from './providers/apns/apns.module';
import { WebPushModule } from './providers/webpush/webpush.module';
import { NotificationModule } from './providers/notification/notification.module';
import { HttpErrorFilter } from './common/filters/http-error.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
      load: [configuration, databaseConfig, redisConfig, fcmConfig],
      validationSchema: envValidationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return configService.get('database')!;
      },
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    CommonModule,
    RedisModule,
    QueueModule.forRoot(),
    FCMModule,
    APNsModule,
    WebPushModule,
    NotificationModule,
    ProjectsModule,
    DevicesModule,
    NotificationsModule,
    TemplatesModule,
    QueuesModule,
    AnalyticsModule,
    AdminModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_FILTER, useClass: HttpErrorFilter },
  ],
})
export class AppModule { }
