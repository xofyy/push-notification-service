import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FCMService } from './fcm.service';

@Module({
  imports: [ConfigModule],
  providers: [FCMService],
  exports: [FCMService],
})
export class FCMModule {}
