import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProjectDocument = Project & Document;

@Schema({
  timestamps: true,
  collection: 'projects',
})
export class Project {
  _id!: Types.ObjectId;

  @Prop({ required: true, trim: true, maxlength: 100 })
  name!: string;

  @Prop({ trim: true, maxlength: 500 })
  description?: string;

  @Prop({ required: true, unique: true })
  apiKey!: string;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({
    type: {
      daily: { type: Number, default: 1000 },
      monthly: { type: Number, default: 10000 },
    },
    default: { daily: 1000, monthly: 10000 },
  })
  limits!: {
    daily: number;
    monthly: number;
  };

  @Prop({
    type: {
      sent: { type: Number, default: 0 },
      delivered: { type: Number, default: 0 },
      failed: { type: Number, default: 0 },
    },
    default: { sent: 0, delivered: 0, failed: 0 },
  })
  stats!: {
    sent: number;
    delivered: number;
    failed: number;
  };

  @Prop({
    type: [
      {
        url: { type: String, required: true },
        events: {
          type: [String],
          default: ['notification.sent', 'notification.delivered'],
        },
      },
    ],
    default: [],
  })
  webhooks!: Array<{
    url: string;
    events: string[];
  }>;

  @Prop({ type: Object, default: {} })
  settings!: Record<string, any>;

  @Prop({ trim: true })
  webhookSecret?: string;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);

// Indexes for performance
ProjectSchema.index({ apiKey: 1 }, { unique: true });
ProjectSchema.index({ isActive: 1 });
ProjectSchema.index({ createdAt: -1 });
