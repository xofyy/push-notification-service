import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { WebhookDelivery, WebhookDeliveryDocument } from '../../../modules/webhooks/schemas/webhook-delivery.schema';

interface WebhookJobData {
  projectId: string;
  url: string;
  event: string;
  body: string; // stringified
  headers: Record<string, string>;
}

@Injectable()
@Processor('webhook-queue')
export class WebhookProcessor extends WorkerHost {
  private readonly logger = new Logger(WebhookProcessor.name);
  constructor(
    @InjectModel(WebhookDelivery.name)
    private readonly deliveryModel: Model<WebhookDeliveryDocument>,
  ) {
    super();
  }

  async process(job: Job<WebhookJobData>): Promise<any> {
    const { projectId, url, event, body, headers } = job.data;
    try {
      // update delivery attempt count
      await this.deliveryModel.updateOne(
        { _id: job.id },
        { $inc: { attempts: 1 } },
      );

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body,
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status} ${res.statusText} ${text}`);
      }

      await this.deliveryModel.updateOne(
        { _id: job.id },
        { $set: { status: 'delivered' } },
      );

      this.logger.log(`Delivered webhook ${event} to ${url}`);
      return { delivered: true };
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      this.logger.warn(`Webhook delivery failed: ${err.message}`);
      await this.deliveryModel.updateOne(
        { _id: job.id },
        { $set: { status: 'failed', lastError: err.message } },
      );
      // Re-throw to let BullMQ retry per attempts/backoff
      throw err;
    }
  }
}

