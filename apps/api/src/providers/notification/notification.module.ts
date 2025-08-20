import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FCMModule } from '../fcm/fcm.module';
import { APNsModule } from '../apns/apns.module';
import { WebPushModule } from '../webpush/webpush.module';
import { ErrorHandlingModule } from '../../common/error-handling/error-handling.module';
import { NotificationService } from './notification.service';

@Module({
  imports: [
    ConfigModule,
    FCMModule,
    APNsModule,
    WebPushModule,
    ErrorHandlingModule,
  ],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
