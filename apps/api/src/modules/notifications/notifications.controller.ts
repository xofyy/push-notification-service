import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import { Headers } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiSecurity,
  ApiHeader,
  ApiBody,
} from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { SendNotificationDto } from './dto/send-notification.dto';
import {
  NotificationStatus,
  NotificationType,
} from './schemas/notification.schema';
import {
  RequireApiKey,
  CurrentProject,
} from '../../common/decorators/auth.decorator';
import {
  HighFrequencyRateLimit,
  MediumFrequencyRateLimit,
} from '../../common/decorators/rate-limit.decorator';
import { Project } from '../projects/schemas/project.schema';
import { ApiPaginatedResponse } from '../../common/dto/paginated-response.decorator';
import { Notification } from './schemas/notification.schema';
import { ErrorResponseDto } from '../../common/dto/error-response.dto';

@ApiTags('Notifications')
@Controller('projects/:projectId/notifications')
@RequireApiKey()
@ApiSecurity('ApiKeyAuth')
@ApiHeader({
  name: 'X-API-Key',
  description: 'API Key for authentication',
  required: true,
})
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

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

  @Post('send')
  @HttpCode(HttpStatus.CREATED)
  @HighFrequencyRateLimit() // 100 requests per minute
  @ApiOperation({
    summary: 'Send push notification',
    description: `
      Sends a push notification to specified devices or user segments.
      Supports multi-platform delivery (iOS, Android, Web) with platform-specific customization.
      Rate limited to 100 requests per minute.
    `,
  })
  @ApiParam({
    name: 'projectId',
    description: 'Project ID',
    example: '64f1a2b3c4d5e6f7a8b9c0d1',
  })
  @ApiResponse({
    status: 201,
    description: 'Notification sent successfully',
    schema: {
      example: {
        id: '64f1a2b3c4d5e6f7a8b9c0d2',
        projectId: '64f1a2b3c4d5e6f7a8b9c0d1',
        status: 'sent',
        type: 'push',
        title: 'Welcome!',
        body: 'Thanks for installing our app!',
        recipients: {
          total: 150,
          successful: 148,
          failed: 2,
        },
        platforms: {
          fcm: { sent: 120, delivered: 118 },
          apns: { sent: 28, delivered: 28 },
          webPush: { sent: 2, delivered: 2 },
        },
        scheduledAt: null,
        sentAt: '2023-12-07T16:30:00.000Z',
        createdAt: '2023-12-07T16:30:00.000Z',
      },
    },
  })
  @ApiBody({
    description: 'Send payload (examples for instant and scheduled)',
    examples: {
      instant: {
        summary: 'Instant send to deviceId',
        value: {
          title: 'Hello from API',
          body: 'Quick flow test',
          type: 'instant',
          targetDevices: ['64f1a2b3c4d5e6f7a8b9c0ff'],
        },
      },
      scheduled: {
        summary: 'Scheduled send to tag segment',
        value: {
          title: 'Scheduled promo',
          body: 'Sale starts soon',
          type: 'scheduled',
          scheduledFor: '2025-12-31T23:50:00.000Z',
          targetTags: ['promo'],
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid notification data',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 429,
    description: 'Rate limit exceeded',
    headers: {
      'X-RateLimit-Limit': {
        description: 'Request limit',
        schema: { type: 'string' },
      },
      'X-RateLimit-Remaining': {
        description: 'Remaining requests',
        schema: { type: 'string' },
      },
      'X-RateLimit-Reset': {
        description: 'Reset time',
        schema: { type: 'string' },
      },
    },
  })
  send(
    @Param('projectId') projectId: string,
    @Body() sendNotificationDto: SendNotificationDto,
    @Headers('Idempotency-Key') idempotencyKey: string,
    @CurrentProject() project: Project,
  ) {
    this.validateProjectAccess(projectId, project);
    return this.notificationsService.send(projectId, sendNotificationDto, idempotencyKey);
  }

  @Get()
  @MediumFrequencyRateLimit() // 300 requests per minute
  @ApiOperation({
    operationId: 'Notifications_List',
    summary: 'List notifications',
    description:
      'Retrieves a paginated list of notifications with optional filtering by status and type.',
  })
  @ApiParam({
    name: 'projectId',
    description: 'Project ID',
    example: '64f1a2b3c4d5e6f7a8b9c0d1',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: NotificationStatus,
    description: 'Filter by notification status',
    example: 'sent',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: NotificationType,
    description: 'Filter by notification type',
    example: 'push',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of notifications to return (max 100)',
    example: 20,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Number of notifications to skip (offset)',
    example: 0,
  })
  @ApiQuery({ name: 'sortBy', required: false, type: String, example: 'createdAt' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'], example: 'desc' })
  @ApiPaginatedResponse(Notification as any)
  findAll(
    @Param('projectId') projectId: string,
    @CurrentProject() project: Project,
    @Query('status') status?: NotificationStatus,
    @Query('type') type?: NotificationType,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    this.validateProjectAccess(projectId, project);
    const options: any = {
      status,
      type,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
      sortBy,
      sortOrder,
    };
    return this.notificationsService.listByProject(projectId, options);
  }

  @Get('stats')
  getStats(
    @Param('projectId') projectId: string,
    @CurrentProject() project: Project,
    @Query('days') days?: string,
  ) {
    this.validateProjectAccess(projectId, project);
    const daysNumber = days ? parseInt(days, 10) : 30;
    return this.notificationsService.getStats(projectId, daysNumber);
  }

  @Get(':id')
  @ApiOperation({ operationId: 'Notifications_GetById', summary: 'Get notification by id' })
  @ApiResponse({ status: 404, description: 'Notification not found', type: ErrorResponseDto })
  findOne(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @CurrentProject() project: Project,
  ) {
    this.validateProjectAccess(projectId, project);
    return this.notificationsService.findOne(projectId, id);
  }

  @Patch(':id/cancel')
  @ApiOperation({ operationId: 'Notifications_Cancel', summary: 'Cancel a scheduled/recurring notification' })
  @ApiResponse({ status: 404, description: 'Notification not found', type: ErrorResponseDto })
  cancel(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @CurrentProject() project: Project,
  ) {
    this.validateProjectAccess(projectId, project);
    return this.notificationsService.cancel(projectId, id);
  }
}
