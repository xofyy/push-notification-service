import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ForbiddenException,
  Sse,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { TrackEventDto, TrackBatchEventsDto } from './dto/track-event.dto';
import {
  AnalyticsQueryDto,
  NotificationFunnelQueryDto,
  EngagementQueryDto,
  PerformanceQueryDto,
} from './dto/analytics-query.dto';
import {
  RequireApiKey,
  CurrentProject,
} from '../../common/decorators/auth.decorator';
import {
  HighFrequencyRateLimit,
  MediumFrequencyRateLimit,
  LowFrequencyRateLimit,
} from '../../common/decorators/rate-limit.decorator';
import { Project } from '../projects/schemas/project.schema';
import { ErrorResponseDto } from '../../common/dto/error-response.dto';
import { Observable } from 'rxjs';

@ApiTags('Analytics')
@Controller('projects/:projectId/analytics')
@RequireApiKey()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) { }

  /**
   * Validates that the projectId parameter matches the authenticated project
   * @param projectId - Project ID from URL parameter
   * @param project - Authenticated project from API key
   */
  private validateProjectAccess(projectId: string, project: Project): void {
    if (project._id.toString() !== projectId) {
      throw new ForbiddenException('Access denied to this project');
    }
  }

  @Post('events')
  @ApiOperation({ operationId: 'Analytics_TrackEvent', summary: 'Track a single analytics event' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiResponse({ status: 201, description: 'Event tracked successfully' })
  @ApiBody({
    description: 'Event payload',
    schema: {
      example: {
        type: 'notification.sent',
        notificationId: '64f1a2b3c4d5e6f7a8b9c0ff',
        deviceId: '64f1a2b3c4d5e6f7a8b9c0aa',
        data: { platform: 'android' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid payload', type: ErrorResponseDto })
  @HttpCode(HttpStatus.CREATED)
  @HighFrequencyRateLimit() // 100 requests per minute for event tracking
  async trackEvent(
    @Param('projectId') projectId: string,
    @Body() trackEventDto: TrackEventDto,
    @CurrentProject() project: Project,
  ) {
    this.validateProjectAccess(projectId, project);
    await this.analyticsService.trackEvent(projectId, trackEventDto);
    return { success: true, message: 'Event tracked successfully' };
  }

  @Post('events/batch')
  @ApiOperation({ operationId: 'Analytics_TrackBatch', summary: 'Track multiple analytics events in batch' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiResponse({
    status: 201,
    description: 'Batch events tracked successfully',
  })
  @ApiBody({
    description: 'Batch payload',
    schema: {
      example: {
        batchId: 'batch-123',
        events: [
          { type: 'notification.sent', notificationId: '...', data: { platform: 'ios' } },
          { type: 'notification.failed', notificationId: '...', data: { error: 'invalid token' } },
        ],
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid payload', type: ErrorResponseDto })
  @HttpCode(HttpStatus.CREATED)
  @HighFrequencyRateLimit() // 100 requests per minute for batch events
  async trackBatchEvents(
    @Param('projectId') projectId: string,
    @Body() trackBatchEventsDto: TrackBatchEventsDto,
    @CurrentProject() project: Project,
  ) {
    this.validateProjectAccess(projectId, project);
    await this.analyticsService.trackBatchEvents(
      projectId,
      trackBatchEventsDto,
    );
    return {
      success: true,
      message: `${trackBatchEventsDto.events.length} events tracked successfully`,
      batchId: trackBatchEventsDto.batchId,
    };
  }

  @Get('events')
  @ApiOperation({
    summary: 'Get analytics events with filtering and pagination',
  })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiResponse({ status: 200, description: 'Events retrieved successfully' })
  async getEvents(
    @Param('projectId') projectId: string,
    @Query() query: AnalyticsQueryDto,
    @CurrentProject() project: Project,
  ) {
    this.validateProjectAccess(projectId, project);
    return this.analyticsService.getEvents(projectId, query);
  }

  @Get('overview')
  @ApiOperation({ operationId: 'Analytics_Overview', summary: 'Get project analytics overview' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiResponse({ status: 200, description: 'Overview retrieved successfully' })
  async getOverview(
    @Param('projectId') projectId: string,
    @Query() query: AnalyticsQueryDto,
    @CurrentProject() project: Project,
  ) {
    this.validateProjectAccess(projectId, project);
    const [events, funnel, engagement, performance] = await Promise.all([
      this.analyticsService.getEvents(projectId, { ...query, limit: 1 }),
      this.analyticsService.getNotificationFunnel(projectId, query),
      this.analyticsService.getEngagementMetrics(projectId, query),
      this.analyticsService.getPerformanceMetrics(projectId, query),
    ]);

    return {
      summary: events.summary,
      notifications: {
        totalSent: funnel.sent,
        deliveryRate: funnel.sent > 0 ? funnel.delivered / funnel.sent : 0,
        openRate: funnel.sent > 0 ? funnel.opened / funnel.sent : 0,
        clickThroughRate: funnel.opened > 0 ? funnel.clicked / funnel.opened : 0,
      },
      engagement: {
        activeDevices: engagement.activeUsers,
        activeUsers: engagement.activeUsers,
        engagementRate: engagement.activeUsers > 0 ? engagement.sessions / engagement.activeUsers : 0,
      },
      performance: {
        apiResponseTime: performance.avgResponseMs,
        apiErrorRate: performance.errorRate,
        queueProcessingTime: performance.queueLatencyMs,
      },
    };
  }

  @Get('notifications')
  @ApiOperation({
    summary: 'Get notification analytics and performance metrics',
  })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiResponse({
    status: 200,
    description: 'Notification analytics retrieved successfully',
  })
  async getNotificationAnalytics(
    @Param('projectId') projectId: string,
    @Query() query: AnalyticsQueryDto,
    @CurrentProject() project: Project,
  ) {
    this.validateProjectAccess(projectId, project);
    const [funnel, events] = await Promise.all([
      this.analyticsService.getNotificationFunnel(projectId, query),
      this.analyticsService.getEvents(projectId, {
        ...query,
        groupBy: 'eventType',
      }),
    ]);

    return {
      funnel: funnel,
      totalSent: funnel.sent,
      eventBreakdown: events.summary,
      timeline: events.events, // This would be time-series data in a real implementation
    };
  }

  @Get('notifications/funnel')
  @ApiOperation({ summary: 'Get notification conversion funnel' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiResponse({
    status: 200,
    description: 'Funnel data retrieved successfully',
  })
  async getNotificationFunnel(
    @Param('projectId') projectId: string,
    @Query() query: NotificationFunnelQueryDto,
    @CurrentProject() project: Project,
  ) {
    this.validateProjectAccess(projectId, project);
    return this.analyticsService.getNotificationFunnel(projectId, query);
  }

  @Get('engagement')
  @ApiOperation({ summary: 'Get user engagement metrics' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiResponse({
    status: 200,
    description: 'Engagement metrics retrieved successfully',
  })
  async getEngagementMetrics(
    @Param('projectId') projectId: string,
    @Query() query: EngagementQueryDto,
    @CurrentProject() project: Project,
  ) {
    this.validateProjectAccess(projectId, project);
    return this.analyticsService.getEngagementMetrics(projectId, query);
  }

  @Get('performance')
  @ApiOperation({ summary: 'Get system performance metrics' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiResponse({
    status: 200,
    description: 'Performance metrics retrieved successfully',
  })
  async getPerformanceMetrics(
    @Param('projectId') projectId: string,
    @Query() query: PerformanceQueryDto,
    @CurrentProject() project: Project,
  ) {
    this.validateProjectAccess(projectId, project);
    return this.analyticsService.getPerformanceMetrics(projectId, query);
  }

  @Get('realtime')
  @ApiOperation({ summary: 'Get real-time analytics dashboard data' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiResponse({
    status: 200,
    description: 'Real-time data retrieved successfully',
  })
  async getRealTimeData(
    @Param('projectId') projectId: string,
    @CurrentProject() project: Project,
  ) {
    this.validateProjectAccess(projectId, project);
    // Get last hour of data for real-time dashboard
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const now = new Date();

    const query: AnalyticsQueryDto = {
      startDate: oneHourAgo.toISOString(),
      endDate: now.toISOString(),
      period: 'hour' as any,
    };

    const [overview, notifications, engagement, performance] =
      await Promise.all([
        this.analyticsService.getEvents(projectId, { ...query, limit: 1 }),
        this.analyticsService.getNotificationFunnel(projectId, query),
        this.analyticsService.getEngagementMetrics(projectId, query),
        this.analyticsService.getPerformanceMetrics(projectId, query),
      ]);

    return {
      timestamp: now.toISOString(),
      timeframe: 'last_hour',
      overview,
      notifications,
      engagement,
      performance,
    };
  }

  @Get('export')
  @ApiOperation({ operationId: 'Analytics_Export', summary: 'Export analytics data' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiQuery({
    name: 'format',
    required: false,
    enum: ['json', 'csv'],
    description: 'Export format',
  })
  @ApiResponse({ status: 200, description: 'Data exported successfully' })
  @LowFrequencyRateLimit() // 1000 requests per hour for exports
  async exportAnalytics(
    @Param('projectId') projectId: string,
    @Query() query: AnalyticsQueryDto,
    @Query('format') format: 'json' | 'csv' = 'json',
    @CurrentProject() project: Project,
  ) {
    this.validateProjectAccess(projectId, project);
    const data = await this.analyticsService.getEvents(projectId, {
      ...query,
      limit: 10000,
    });

    if (format === 'csv') {
      const rows = Array.isArray(data.events) ? data.events : [];
      const cols = ['timestamp', 'type', 'notificationId', 'deviceId'];
      const header = cols.join(',');
      const csvLines = [header];
      for (const ev of rows) {
        const ts = ev.timestamp ? new Date(ev.timestamp).toISOString() : '';
        const nid = ev.notificationId || '';
        const did = ev.deviceId || '';
        const line = [ts, ev.type || '', String(nid), String(did)]
          .map((v) => String(v).replace(/"/g, '""'))
          .map((v) => (v.includes(',') ? `"${v}"` : v))
          .join(',');
        csvLines.push(line);
      }
      return {
        format: 'csv',
        filename: `analytics-${projectId}-${Date.now()}.csv`,
        data: csvLines.join('\n'),
        total: data.total,
      };
    }

    return {
      format: 'json',
      filename: `analytics-${projectId}-${Date.now()}.json`,
      data: data.events,
      total: data.total,
      summary: data.summary,
    };
  }

  @Sse('realtime-sse')
  @ApiOperation({ summary: 'Server-Sent Events for real-time analytics (last hour, updates every 30s)' })
  realtimeSSE(@Param('projectId') projectId: string, @CurrentProject() project: Project): Observable<MessageEvent> {
    this.validateProjectAccess(projectId, project);
    return this.analyticsService.getRealtimeStream(projectId);
  }
}
