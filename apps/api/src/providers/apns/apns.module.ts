import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APNsService } from './apns.service';

@Module({
  imports: [ConfigModule],
  providers: [APNsService],
  exports: [APNsService],
})
export class APNsModule {}
