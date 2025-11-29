import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery } from 'mongoose';
import { AnalyticsQueryDto, EngagementQueryDto, NotificationFunnelQueryDto, PerformanceQueryDto } from './dto/analytics-query.dto';
import { TrackBatchEventsDto, TrackEventDto } from './dto/track-event.dto';
import { Event, EventDocument } from './schemas/event.schema';
import { Metrics, MetricsDocument, Granularity } from './schemas/metrics.schema';
import { Observable, interval, map, switchMap, catchError, of } from 'rxjs';

export interface AnalyticsOverview {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  failed: number;
  conversionRate: number;
}

export interface EngagementMetrics {
  activeUsers: number;
  sessions: number;
  opens: number;
  clicks: number;
}

export interface PerformanceMetrics {
  avgResponseMs: number;
  queueLatencyMs: number;
  errorRate: number;
}

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);
  constructor(
    @InjectModel(Event.name) private readonly eventModel: Model<EventDocument>,
    @InjectModel(Metrics.name) private readonly metricsModel: Model<MetricsDocument>,
  ) { }

  async trackEvent(projectId: string, dto: TrackEventDto): Promise<void> {
    const doc = new this.eventModel({
      projectId: new Types.ObjectId(projectId),
      type: dto.type,
      timestamp: dto.timestamp ? new Date(dto.timestamp) : new Date(),
      deviceId: dto.deviceId ? new Types.ObjectId(dto.deviceId) : undefined,
      notificationId: dto.notificationId
        ? new Types.ObjectId(dto.notificationId)
        : undefined,
      data: dto.data || {},
    });
    await doc.save();
    await this.updateMetrics(projectId, doc.type, doc.timestamp);
  }

  async trackBatchEvents(projectId: string, dto: TrackBatchEventsDto): Promise<void> {
    const docs = (dto.events || []).map((e) => ({
      projectId: new Types.ObjectId(projectId),
      type: e.type,
      timestamp: e.timestamp ? new Date(e.timestamp) : new Date(),
      deviceId: e.deviceId ? new Types.ObjectId(e.deviceId) : undefined,
      notificationId: e.notificationId
        ? new Types.ObjectId(e.notificationId)
        : undefined,
      data: e.data || {},
    }));
    if (docs.length) {
      await this.eventModel.insertMany(docs, { ordered: false });
      // Update metrics in bulk (minute granularity is sufficient for now)
      const now = new Date();
      // Aggregate counts by type
      const counts: Record<string, number> = {};
      for (const e of docs) {
        counts[e.type] = (counts[e.type] || 0) + 1;
      }
      // For simplicity, update per-type sequentially
      for (const [type, count] of Object.entries(counts)) {
        await this.updateMetrics(projectId, type, now, count);
      }
    }
  }

  async getEvents(projectId: string, query: AnalyticsQueryDto): Promise<{ events: Event[]; total: number; summary: { pageSize: number; offset: number } }> {
    const q: FilterQuery<EventDocument> = { projectId: new Types.ObjectId(projectId) };
    if (query.startDate || query.endDate) {
      q.timestamp = {};
      if (query.startDate) q.timestamp.$gte = new Date(query.startDate);
      if (query.endDate) q.timestamp.$lte = new Date(query.endDate);
    }
    const limit = Math.min(Math.max(query.limit ?? 50, 1), 1000);
    const offset = Math.max(query.offset ?? 0, 0);

    const [events, total] = await Promise.all([
      this.eventModel.find(q).sort({ timestamp: -1 }).skip(offset).limit(limit).exec(),
      this.eventModel.countDocuments(q),
    ]);

    return { events, total, summary: { pageSize: limit, offset } };
  }

  async getNotificationFunnel(projectId: string, _query: NotificationFunnelQueryDto): Promise<AnalyticsOverview> {
    const pid = new Types.ObjectId(projectId);
    const types = [
      'notification.sent',
      'notification.delivered',
      'notification.opened',
      'notification.clicked',
      'notification.failed',
    ];

    const results = await this.eventModel.aggregate([
      { $match: { projectId: pid, type: { $in: types } } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]);

    const map = Object.fromEntries(results.map((r: { _id: string; count: number }) => [r._id, r.count]));
    const sent = map['notification.sent'] || 0;
    const delivered = map['notification.delivered'] || 0;
    const opened = map['notification.opened'] || 0;
    const clicked = map['notification.clicked'] || 0;
    const failed = map['notification.failed'] || 0;
    const conversionRate = sent ? Math.round((opened / sent) * 10000) / 100 : 0;

    return { sent, delivered, opened, clicked, failed, conversionRate };
  }

  async getEngagementMetrics(projectId: string, _query: EngagementQueryDto): Promise<EngagementMetrics> {
    const pid = new Types.ObjectId(projectId);
    const [opens, clicks, activeDevices] = await Promise.all([
      this.eventModel.countDocuments({ projectId: pid, type: 'notification.opened' }),
      this.eventModel.countDocuments({ projectId: pid, type: 'notification.clicked' }),
      this.eventModel.distinct('deviceId', { projectId: pid }).then((arr) => arr.filter(Boolean).length),
    ]);
    return { activeUsers: activeDevices, sessions: opens, opens, clicks };
  }

  async getPerformanceMetrics(projectId: string, _query: PerformanceQueryDto): Promise<PerformanceMetrics> {
    // Placeholder until detailed timing data exists
    return { avgResponseMs: 0, queueLatencyMs: 0, errorRate: 0 };
  }

  getRealtimeStream(projectId: string): Observable<MessageEvent> {
    return interval(30000).pipe(
      switchMap(async () => {
        try {
          const now = new Date();
          const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
          const payload = await this.getEvents(projectId, {
            startDate: hourAgo.toISOString(),
            endDate: now.toISOString(),
            limit: 1,
          });
          const funnel = await this.getNotificationFunnel(projectId, { startDate: hourAgo.toISOString(), endDate: now.toISOString() } as any);
          return {
            data: {
              type: 'overview',
              ts: now.toISOString(),
              total: payload.total,
              funnel
            }
          } as MessageEvent;
        } catch (e) {
          return {
            data: {
              type: 'error',
              message: e instanceof Error ? e.message : String(e)
            }
          } as MessageEvent;
        }
      }),
      catchError(err => of({
        data: {
          type: 'error',
          message: err instanceof Error ? err.message : String(err)
        }
      } as MessageEvent))
    );
  }

  private async updateMetrics(
    projectId: string,
    type: string,
    timestamp: Date,
    count = 1,
  ): Promise<void> {
    const pid = new Types.ObjectId(projectId);
    // Compute bucket starts
    const minute = new Date(Date.UTC(
      timestamp.getUTCFullYear(),
      timestamp.getUTCMonth(),
      timestamp.getUTCDate(),
      timestamp.getUTCHours(),
      timestamp.getUTCMinutes(),
      0,
      0,
    ));
    const hour = new Date(Date.UTC(
      timestamp.getUTCFullYear(),
      timestamp.getUTCMonth(),
      timestamp.getUTCDate(),
      timestamp.getUTCHours(),
      0,
      0,
      0,
    ));

    const inc = this.buildCounterInc(type, count);
    if (!inc) return;

    await Promise.all([
      this.metricsModel.updateOne(
        { projectId: pid, granularity: 'minute' as Granularity, bucket: minute },
        { $inc: inc },
        { upsert: true },
      ),
      this.metricsModel.updateOne(
        { projectId: pid, granularity: 'hour' as Granularity, bucket: hour },
        { $inc: inc },
        { upsert: true },
      ),
    ]);
  }

  private buildCounterInc(
    type: string,
    count: number,
  ): Record<string, number> | null {
    const map: Record<string, string> = {
      'notification.sent': 'sent',
      'notification.delivered': 'delivered',
      'notification.failed': 'failed',
      'notification.opened': 'opened',
      'notification.clicked': 'clicked',
    };
    const key = map[type];
    if (!key) return null;
    return { [key]: count } as Record<string, number>;
  }
}
