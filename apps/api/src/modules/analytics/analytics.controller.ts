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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
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

@ApiTags('Analytics')
@Controller('projects/:projectId/analytics')
@RequireApiKey()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

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
  @ApiOperation({ summary: 'Track a single analytics event' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiResponse({ status: 201, description: 'Event tracked successfully' })
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
  @ApiOperation({ summary: 'Track multiple analytics events in batch' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiResponse({
    status: 201,
    description: 'Batch events tracked successfully',
  })
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
  @ApiOperation({ summary: 'Get project analytics overview' })
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
        totalSent: funnel.totalSent,
        deliveryRate: funnel.funnel[1]?.rate || 0,
        openRate: funnel.funnel[2]?.rate || 0,
        clickThroughRate: funnel.funnel[3]?.rate || 0,
      },
      engagement: {
        activeDevices: engagement.activeDevices,
        activeUsers: engagement.activeUsers,
        engagementRate: engagement.engagementRate,
      },
      performance: {
        apiResponseTime: performance.apiMetrics.avgResponseTime,
        apiErrorRate: performance.apiMetrics.errorRate,
        queueProcessingTime: performance.queueMetrics.avgProcessingTime,
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
      funnel: funnel.funnel,
      totalSent: funnel.totalSent,
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
  @ApiOperation({ summary: 'Export analytics data' })
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
      limit: 10000, // Allow larger export
    });

    if (format === 'csv') {
      // In a real implementation, convert to CSV format
      return {
        format: 'csv',
        filename: `analytics-${projectId}-${Date.now()}.csv`,
        data: data.events,
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
}
