import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WebPushService } from './webpush.service';

@Module({
  imports: [ConfigModule],
  providers: [WebPushService],
  exports: [WebPushService],
})
export class WebPushModule {}
