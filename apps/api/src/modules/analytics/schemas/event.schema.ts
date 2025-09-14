import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EventDocument = Event & Document;

@Schema({ timestamps: true, collection: 'analytics_events' })
export class Event {
  @Prop({ required: true, ref: 'Project' })
  projectId!: Types.ObjectId;

  @Prop({ required: true })
  type!: string; // e.g., notification.sent, notification.delivered, notification.opened, etc.

  @Prop({ default: () => new Date() })
  timestamp!: Date;

  @Prop({ type: Types.ObjectId, ref: 'Notification' })
  notificationId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Device' })
  deviceId?: Types.ObjectId;

  @Prop({ type: Object, default: {} })
  data!: Record<string, unknown>;
}

export const EventSchema = SchemaFactory.createForClass(Event);

// Indexes for common queries
EventSchema.index({ projectId: 1, timestamp: -1 });
EventSchema.index({ projectId: 1, type: 1, timestamp: -1 });
EventSchema.index({ notificationId: 1 });
EventSchema.index({ deviceId: 1 });

