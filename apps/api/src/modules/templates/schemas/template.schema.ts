import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TemplateDocument = Template & Document;

@Schema({ timestamps: true })
export class Template {
  @Prop({ required: true })
  projectId: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  body: string;

  @Prop()
  imageUrl?: string;

  @Prop({ type: Object, default: {} })
  data?: Record<string, any>;

  @Prop({ type: [String], default: [] })
  variables: string[];

  @Prop({ enum: ['active', 'inactive'], default: 'active' })
  status: 'active' | 'inactive';

  @Prop({ type: Object, default: {} })
  defaultValues?: Record<string, any>;

  @Prop()
  language?: string;

  @Prop({ type: Object })
  validationRules?: {
    required?: string[];
    formats?: Record<string, string>;
    ranges?: Record<string, { min?: number; max?: number }>;
  };

  @Prop({ type: Object })
  statistics?: {
    totalUsed: number;
    lastUsed: Date;
    successRate: number;
  };

  @Prop()
  version: number;

  @Prop()
  createdBy?: string;

  @Prop()
  updatedBy?: string;
}

export const TemplateSchema = SchemaFactory.createForClass(Template);

TemplateSchema.index({ projectId: 1, name: 1 }, { unique: true });
TemplateSchema.index({ projectId: 1, status: 1 });
TemplateSchema.index({ 'statistics.totalUsed': -1 });