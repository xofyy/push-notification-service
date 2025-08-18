import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DeviceDocument = Device & Document;

export enum Platform {
  IOS = 'ios',
  ANDROID = 'android',
  WEB = 'web',
}

@Schema({ 
  timestamps: true,
  collection: 'devices'
})
export class Device {
  @Prop({ required: true, ref: 'Project' })
  projectId: Types.ObjectId;

  @Prop({ required: true })
  token: string;

  @Prop({ required: true, enum: Platform })
  platform: Platform;

  @Prop({ trim: true })
  userId?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: [String], default: [] })
  topics: string[];

  @Prop({ type: Object, default: {} })
  properties: Record<string, any>;

  @Prop({ 
    type: {
      language: String,
      country: String,
      timezone: String,
      appVersion: String,
      deviceModel: String,
      osVersion: String,
    },
    default: {}
  })
  metadata: {
    language?: string;
    country?: string;
    timezone?: string;
    appVersion?: string;
    deviceModel?: string;
    osVersion?: string;
  };

  @Prop({ default: Date.now })
  lastActiveAt: Date;

  @Prop({ default: 0 })
  notificationsSent: number;

  @Prop({ default: 0 })
  notificationsDelivered: number;

  @Prop({ default: 0 })
  notificationsOpened: number;
}

export const DeviceSchema = SchemaFactory.createForClass(Device);

// Compound indexes for performance
DeviceSchema.index({ projectId: 1, token: 1 }, { unique: true });
DeviceSchema.index({ projectId: 1, platform: 1 });
DeviceSchema.index({ projectId: 1, userId: 1 });
DeviceSchema.index({ projectId: 1, tags: 1 });
DeviceSchema.index({ projectId: 1, topics: 1 });
DeviceSchema.index({ projectId: 1, isActive: 1 });
DeviceSchema.index({ lastActiveAt: 1 });

// TTL index for inactive devices (30 days)
DeviceSchema.index({ lastActiveAt: 1 }, { expireAfterSeconds: 2592000 });