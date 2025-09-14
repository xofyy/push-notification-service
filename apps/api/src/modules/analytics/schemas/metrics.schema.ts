import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MetricsDocument = Metrics & Document;

export type Granularity = 'minute' | 'hour' | 'day';

@Schema({ timestamps: true, collection: 'analytics_metrics' })
export class Metrics {
  @Prop({ required: true, ref: 'Project' })
  projectId!: Types.ObjectId;

  // Start of the bucket (e.g., minute/hour/day start in UTC)
  @Prop({ required: true })
  bucket!: Date;

  @Prop({ required: true, enum: ['minute', 'hour', 'day'] })
  granularity!: Granularity;

  @Prop({ default: 0 })
  sent!: number;

  @Prop({ default: 0 })
  delivered!: number;

  @Prop({ default: 0 })
  failed!: number;

  @Prop({ default: 0 })
  opened!: number;

  @Prop({ default: 0 })
  clicked!: number;
}

export const MetricsSchema = SchemaFactory.createForClass(Metrics);

MetricsSchema.index({ projectId: 1, granularity: 1, bucket: 1 }, { unique: true });

