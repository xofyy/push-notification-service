import { Injectable, Logger } from '@nestjs/common';
import { ProjectsService } from '../projects/projects.service';
import { createHmac } from 'node:crypto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { WebhookDelivery, WebhookDeliveryDocument } from './schemas/webhook-delivery.schema';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, JobsOptions } from 'bullmq';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);
  constructor(
    private readonly projectsService: ProjectsService,
    @InjectModel(WebhookDelivery.name)
    private readonly deliveryModel: Model<WebhookDeliveryDocument>,
    @InjectQueue('webhook-queue')
    private readonly webhookQueue: Queue | null,
  ) {}

  async list(projectId: string) {
    const project = await this.projectsService.findOne(projectId);
    return project.webhooks || [];
  }

  async add(projectId: string, data: { url: string; events: string[] }) {
    const project = await this.projectsService.findOne(projectId);
    const webhooks = project.webhooks || [];
    webhooks.push({ url: data.url, events: data.events });
    await this.projectsService.update(projectId, { webhooks } as any);
    return { success: true, webhooks };
  }

  async update(
    projectId: string,
    index: number,
    data: { url?: string; events?: string[] },
  ) {
    const project = await this.projectsService.findOne(projectId);
    const webhooks = project.webhooks || [];
    if (index < 0 || index >= webhooks.length) {
      throw new Error('Webhook index out of range');
    }
    const current = webhooks[index];
    webhooks[index] = {
      url: data.url ?? current.url,
      events: data.events ?? current.events,
    } as any;
    await this.projectsService.update(projectId, { webhooks } as any);
    return { success: true, webhooks };
  }

  async remove(projectId: string, index: number) {
    const project = await this.projectsService.findOne(projectId);
    const webhooks = project.webhooks || [];
    if (index < 0 || index >= webhooks.length) {
      throw new Error('Webhook index out of range');
    }
    webhooks.splice(index, 1);
    await this.projectsService.update(projectId, { webhooks } as any);
    return { success: true, webhooks };
  }

  async dispatch(
    projectId: string,
    event: string,
    payload: Record<string, unknown>,
  ) {
    const project = await this.projectsService.findOne(projectId);
    const webhooks = (project.webhooks || []).filter((w: any) =>
      (w.events || []).includes(event),
    );
    if (webhooks.length === 0) return { delivered: 0 };

    const secret = project.webhookSecret || project.apiKey;
    const body = JSON.stringify({ event, projectId, payload, ts: Date.now() });
    const signature = createHmac('sha256', secret).update(body).digest('hex');

    let queued = 0;
    for (const wh of webhooks) {
      const delivery = await new this.deliveryModel({
        projectId: new Types.ObjectId(projectId),
        url: wh.url,
        event,
        status: 'pending',
        attempts: 0,
        payload,
      }).save();

      if (this.webhookQueue) {
        const opts: JobsOptions = {
          attempts: 5,
          backoff: { type: 'exponential', delay: 2000 },
          removeOnComplete: true,
          removeOnFail: false,
          jobId: (delivery._id as any as Types.ObjectId).toString(),
        };
        await this.webhookQueue.add(
          'deliver',
          {
            projectId,
            url: wh.url,
            event,
            body,
            headers: {
              'X-Webhook-Event': event,
              'X-Webhook-Signature': signature,
              'X-Project-Id': projectId,
            },
          },
          opts,
        );
        queued++;
      }
    }
    return { queued };
  }

  async rotateSecret(projectId: string) {
    const buf = (await import('node:crypto')).randomBytes(32);
    const secret = buf.toString('hex');
    const updated = await this.projectsService.update(projectId, {
      webhookSecret: secret,
    } as any);
    return { projectId, webhookSecret: updated.webhookSecret };
  }

  async listDeliveries(
    projectId: string,
    limit = 20,
    offset = 0,
  ): Promise<{ items: WebhookDelivery[]; total: number; limit: number; offset: number }> {
    const query = { projectId: new Types.ObjectId(projectId) } as any;
    const [items, total] = await Promise.all([
      this.deliveryModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(Math.min(Math.max(limit, 1), 100))
        .select('-__v')
        .lean(),
      this.deliveryModel.countDocuments(query),
    ]);
    return { items: items as any, total, limit, offset };
  }
}
