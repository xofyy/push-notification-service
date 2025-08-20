import { Module } from '@nestjs/common';
import { QueueModule } from '../../common/queue/queue.module';
import { QueuesController } from './queues.controller';
import { QueuesService } from './queues.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [QueueModule.forRoot(), NotificationsModule],
  controllers: [QueuesController],
  providers: [QueuesService],
  exports: [QueuesService],
})
export class QueuesModule {}