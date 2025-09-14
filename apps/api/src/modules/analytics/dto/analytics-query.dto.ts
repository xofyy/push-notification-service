export class AnalyticsQueryDto {
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
  period?: 'minute' | 'hour' | 'day' | 'week' | 'month';
  groupBy?: string;
}

export class NotificationFunnelQueryDto extends AnalyticsQueryDto {}

export class EngagementQueryDto extends AnalyticsQueryDto {}

export class PerformanceQueryDto extends AnalyticsQueryDto {}
