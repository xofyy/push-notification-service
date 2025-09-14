import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { RedisModule } from '../../common/redis';
import { FCMModule } from '../../providers/fcm/fcm.module';
import { APNsModule } from '../../providers/apns/apns.module';
import { WebPushModule } from '../../providers/webpush/webpush.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [MongooseModule, RedisModule, FCMModule, APNsModule, WebPushModule],
  controllers: [HealthController],
})
export class HealthModule {}
