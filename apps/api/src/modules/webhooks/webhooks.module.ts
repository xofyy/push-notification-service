import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bullmq';
import { ProjectsModule } from '../projects/projects.module';
import { WebhooksService } from './webhooks.service';
import { WebhooksController } from './webhooks.controller';
import { WebhookDelivery, WebhookDeliverySchema } from './schemas/webhook-delivery.schema';

@Module({
  imports: [
    ProjectsModule,
    MongooseModule.forFeature([
      { name: WebhookDelivery.name, schema: WebhookDeliverySchema },
    ]),
    BullModule.registerQueue({ name: 'webhook-queue' }),
  ],
  providers: [WebhooksService],
  controllers: [WebhooksController],
  exports: [WebhooksService],
})
export class WebhooksModule {}
