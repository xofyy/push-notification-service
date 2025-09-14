import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WebhookDeliveryDocument = WebhookDelivery & Document;

@Schema({ timestamps: true, collection: 'webhook_deliveries' })
export class WebhookDelivery {
  @Prop({ required: true, ref: 'Project' })
  projectId!: Types.ObjectId;

  @Prop({ required: true })
  url!: string;

  @Prop({ required: true })
  event!: string;

  @Prop({ default: 'pending', enum: ['pending', 'delivered', 'failed'] })
  status!: 'pending' | 'delivered' | 'failed';

  @Prop({ default: 0 })
  attempts!: number;

  @Prop()
  lastError?: string;

  @Prop({ type: Object })
  payload?: Record<string, unknown>;
}

export const WebhookDeliverySchema = SchemaFactory.createForClass(WebhookDelivery);

WebhookDeliverySchema.index({ projectId: 1, createdAt: -1 });

