import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NotificationDocument = Notification & Document;

export enum NotificationStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SENT = 'sent',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum NotificationType {
  INSTANT = 'instant',
  SCHEDULED = 'scheduled',
  RECURRING = 'recurring',
}

@Schema({
  timestamps: true,
  collection: 'notifications',
})
export class Notification {
  @Prop({ required: true, ref: 'Project' })
  projectId!: Types.ObjectId;

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  body!: string;

  @Prop()
  imageUrl?: string;

  @Prop()
  actionUrl?: string;

  @Prop({ type: Object, default: {} })
  data!: Record<string, any>;

  @Prop({
    required: true,
    enum: NotificationType,
    default: NotificationType.INSTANT,
  })
  type!: NotificationType;

  @Prop({
    required: true,
    enum: NotificationStatus,
    default: NotificationStatus.PENDING,
  })
  status!: NotificationStatus;

  // Targeting
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Device' }], default: [] })
  targetDevices!: Types.ObjectId[];

  @Prop({ type: [String], default: [] })
  targetTags!: string[];

  @Prop({ type: [String], default: [] })
  targetTopics!: string[];

  @Prop({ type: Object })
  targetQuery?: Record<string, any>;

  // Scheduling
  @Prop()
  scheduledFor?: Date;

  @Prop()
  expiresAt?: Date;

  @Prop({
    type: {
      pattern: String, // cron pattern
      timezone: String,
      endDate: Date,
    },
  })
  recurring?: {
    pattern: string;
    timezone: string;
    endDate?: Date;
  };

  // Statistics
  @Prop({ default: 0 })
  targetCount!: number;

  @Prop({ default: 0 })
  sentCount!: number;

  @Prop({ default: 0 })
  deliveredCount!: number;

  @Prop({ default: 0 })
  failedCount!: number;

  @Prop({ default: 0 })
  openedCount!: number;

  @Prop({ default: 0 })
  clickedCount!: number;

  // Processing metadata
  @Prop()
  processedAt?: Date;

  @Prop()
  sentAt?: Date;

  @Prop()
  completedAt?: Date;

  @Prop({ type: [String], default: [] })
  errors!: string[];

  @Prop({ type: Object, default: {} })
  metadata!: Record<string, any>;

  // Template reference
  @Prop({ ref: 'Template' })
  templateId?: Types.ObjectId;

  @Prop({ type: Object })
  templateVariables?: Record<string, any>;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

// Indexes for performance
NotificationSchema.index({ projectId: 1, status: 1 });
NotificationSchema.index({ projectId: 1, type: 1 });
NotificationSchema.index({ scheduledFor: 1 });
NotificationSchema.index({ expiresAt: 1 });
NotificationSchema.index({ createdAt: -1 });
NotificationSchema.index({ targetTags: 1 });
NotificationSchema.index({ targetTopics: 1 });

// TTL index for completed notifications (30 days)
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });
