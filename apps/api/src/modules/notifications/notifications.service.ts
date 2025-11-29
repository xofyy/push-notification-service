import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  Optional,
} from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Types, Connection, FilterQuery, UpdateQuery } from 'mongoose';
import {
  Notification,
  NotificationDocument,
  NotificationStatus,
  NotificationType,
} from './schemas/notification.schema';
import { Device, DeviceDocument } from '../devices/schemas/device.schema';
import { SendNotificationDto } from './dto/send-notification.dto';
import { TemplatesService } from '../templates/templates.service';
import { QueueService, QueuePriority } from '../../common/queue/queue.service';
import { PaginatedResult } from '../../common/interfaces/pagination.interface';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
    @InjectModel(Device.name)
    private deviceModel: Model<DeviceDocument>,
    @InjectConnection() private connection: Connection,
    private templatesService: TemplatesService,
    @Optional() private readonly queueService?: QueueService,
  ) { }

  async listByProject(
    projectId: string,
    options: {
      status?: NotificationStatus;
      type?: NotificationType;
      limit?: number;
      offset?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    } = {},
  ): Promise<PaginatedResult<Notification>> {
    const query: FilterQuery<NotificationDocument> = { projectId: new Types.ObjectId(projectId) };
    if (options.status) query.status = options.status;
    if (options.type) query.type = options.type;

    const sort: any = {};
    const sortField = options.sortBy || 'createdAt';
    const sortDir = options.sortOrder === 'asc' ? 1 : -1;
    sort[sortField] = sortDir;

    const limit = Math.min(Math.max(options.limit ?? 20, 1), 100);
    const offset = Math.max(options.offset ?? 0, 0);

    const [items, total] = await Promise.all([
      this.notificationModel
        .find(query)
        .sort(sort)
        .skip(offset)
        .limit(limit)
        .select('-__v')
        .exec(),
      this.notificationModel.countDocuments(query).exec(),
    ]);

    return { items, total, limit, offset };
  }

  async send(
    projectId: string,
    sendNotificationDto: SendNotificationDto,
    idempotencyKey?: string,
  ): Promise<Notification> {
    // Validate targeting
    const hasTargeting =
      sendNotificationDto.targetDevices?.length ||
      sendNotificationDto.targetTags?.length ||
      sendNotificationDto.targetTopics?.length ||
      sendNotificationDto.targetQuery;

    if (!hasTargeting) {
      throw new BadRequestException(
        'At least one targeting method must be specified',
      );
    }

    // Process template if provided
    let processedNotification = { ...sendNotificationDto };
    if (
      sendNotificationDto.templateId &&
      sendNotificationDto.templateVariables
    ) {
      try {
        const renderedTemplate = await this.templatesService.render(projectId, {
          template: sendNotificationDto.templateId,
          variables: sendNotificationDto.templateVariables,
        });

        processedNotification = {
          ...sendNotificationDto,
          title: renderedTemplate.title,
          body: renderedTemplate.body,
          imageUrl: renderedTemplate.imageUrl || sendNotificationDto.imageUrl,
          data: { ...renderedTemplate.data, ...sendNotificationDto.data },
        };
      } catch (error) {
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        throw new BadRequestException(
          `Template rendering failed: ${errorObj.message}`,
        );
      }
    } else if (sendNotificationDto.templateId) {
      throw new BadRequestException(
        'Template variables are required when using a template',
      );
    }

    // Validate scheduling
    if (
      processedNotification.type === NotificationType.SCHEDULED &&
      !processedNotification.scheduledFor
    ) {
      throw new BadRequestException(
        'Scheduled notifications must have a scheduledFor date',
      );
    }

    if (
      processedNotification.type === NotificationType.RECURRING &&
      !processedNotification.recurring
    ) {
      throw new BadRequestException(
        'Recurring notifications must have recurring configuration',
      );
    }

    // Validate target devices if provided
    if (processedNotification.targetDevices?.length) {
      const deviceCount = await this.deviceModel.countDocuments({
        _id: {
          $in: processedNotification.targetDevices.map(
            (id) => new Types.ObjectId(id),
          ),
        },
        projectId: new Types.ObjectId(projectId),
      });

      if (deviceCount === 0) {
        throw new BadRequestException(
          'No valid devices found for the provided IDs',
        );
      }
    }

    // Idempotency: return existing by key if provided
    if (idempotencyKey) {
      const existing = await this.notificationModel
        .findOne({ projectId: new Types.ObjectId(projectId), idempotencyKey })
        .exec();
      if (existing) {
        return existing;
      }
    }

    // Create notification
    const notification = new this.notificationModel({
      projectId: new Types.ObjectId(projectId),
      ...processedNotification,
      idempotencyKey,
      targetDevices: processedNotification.targetDevices?.map(
        (id) => new Types.ObjectId(id),
      ),
      templateId: processedNotification.templateId
        ? new Types.ObjectId(processedNotification.templateId)
        : undefined,
      scheduledFor: processedNotification.scheduledFor
        ? new Date(processedNotification.scheduledFor)
        : undefined,
      expiresAt: processedNotification.expiresAt
        ? new Date(processedNotification.expiresAt)
        : undefined,
      recurring: processedNotification.recurring
        ? {
          ...processedNotification.recurring,
          endDate: processedNotification.recurring.endDate
            ? new Date(processedNotification.recurring.endDate)
            : undefined,
        }
        : undefined,
    });

    const session = await this.connection.startSession();
    let savedNotification: NotificationDocument;

    try {
      await session.withTransaction(async () => {
        savedNotification = await notification.save({ session });

        // Enqueue or schedule based on type
        const type = processedNotification.type || NotificationType.INSTANT;
        if (!this.queueService) {
          this.logger.warn('QueueService not available; notification queued state may be pending.');
          return;
        }

        const baseJob = {
          projectId,
          payload: {
            title: processedNotification.title,
            body: processedNotification.body,
            imageUrl: processedNotification.imageUrl,
            data: processedNotification.data,
          },
          targeting: {
            deviceIds: processedNotification.targetDevices,
            segment: processedNotification.targetQuery,
            topics: processedNotification.targetTopics,
          },
          options: {
            trackDelivery: true,
            metadata: {
              notificationId: (savedNotification._id as Types.ObjectId).toString(),
              templateId: processedNotification.templateId,
            },
          },
        } as const;

        if (type === NotificationType.INSTANT) {
          await this.queueService.addNotificationJob(baseJob, {
            priority: QueuePriority.NORMAL,
            jobId: (savedNotification._id as Types.ObjectId).toString(),
          });
        } else if (type === NotificationType.SCHEDULED && processedNotification.scheduledFor) {
          // Prefer existing QueueService implementation if present
          if (typeof this.queueService.addScheduledJob === 'function') {
            await this.queueService.addScheduledJob(
              {
                ...baseJob,
                sendAt: new Date(processedNotification.scheduledFor),
                timezone: processedNotification.recurring?.timezone,
              },
              { priority: QueuePriority.NORMAL },
            );
          } else {
            this.logger.warn('addScheduledJob not available on QueueService');
          }
        } else if (type === NotificationType.RECURRING && processedNotification.recurring) {
          const schedule = processedNotification.recurring.pattern
            ? { type: 'cron' as const, value: processedNotification.recurring.pattern, timezone: processedNotification.recurring.timezone }
            : { type: 'interval' as const, value: 0 };
          if (typeof this.queueService.addRecurringJob === 'function') {
            await this.queueService.addRecurringJob(
              {
                ...baseJob,
                schedule,
                endDate: processedNotification.recurring.endDate
                  ? new Date(processedNotification.recurring.endDate)
                  : undefined,
              },
              { priority: QueuePriority.NORMAL },
            );
          } else {
            this.logger.warn('addRecurringJob not available on QueueService');
          }
        }
      });
    } catch (error) {
      this.logger.error(`Transaction failed: ${error}`);
      throw error;
    } finally {
      await session.endSession();
    }

    return savedNotification!;
  }

  async findByProject(
    projectId: string,
    filters: {
      status?: NotificationStatus;
      type?: NotificationType;
      limit?: number;
      skip?: number;
    } = {},
  ): Promise<{ notifications: Notification[]; total: number }> {
    const query: FilterQuery<NotificationDocument> = { projectId: new Types.ObjectId(projectId) };

    if (filters.status) query.status = filters.status;
    if (filters.type) query.type = filters.type;

    const total = await this.notificationModel.countDocuments(query);
    const notifications = await this.notificationModel
      .find(query)
      .select('-__v')
      .sort({ createdAt: -1 })
      .limit(filters.limit || 50)
      .skip(filters.skip || 0)
      .exec();

    return { notifications, total };
  }

  async findOne(
    projectId: string,
    notificationId: string,
  ): Promise<Notification> {
    const notification = await this.notificationModel
      .findOne({
        _id: notificationId,
        projectId: new Types.ObjectId(projectId),
      })
      .select('-__v')
      .exec();

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return notification;
  }

  async cancel(
    projectId: string,
    notificationId: string,
  ): Promise<Notification> {
    const notification = await this.notificationModel
      .findOneAndUpdate(
        {
          _id: notificationId,
          projectId: new Types.ObjectId(projectId),
          status: {
            $in: [NotificationStatus.PENDING, NotificationStatus.PROCESSING],
          },
        },
        {
          status: NotificationStatus.CANCELLED,
          completedAt: new Date(),
        },
        { new: true },
      )
      .select('-__v')
      .exec();

    if (!notification) {
      throw new NotFoundException(
        'Notification not found or cannot be cancelled',
      );
    }

    // Remove from queue if pending
    if (this.queueService) {
      await this.queueService.removeNotificationJob(notificationId);
    }

    return notification;
  }

  async updateStatus(
    notificationId: string,
    status: NotificationStatus,
    metadata?: Record<string, any>,
  ): Promise<void> {
    const updateData: UpdateQuery<NotificationDocument> = { status };

    if (status === NotificationStatus.PROCESSING) {
      updateData.processedAt = new Date();
    } else if (status === NotificationStatus.SENT) {
      updateData.sentAt = new Date();
    } else if (
      [
        NotificationStatus.DELIVERED,
        NotificationStatus.FAILED,
        NotificationStatus.CANCELLED,
      ].includes(status)
    ) {
      updateData.completedAt = new Date();
    }

    if (metadata) {
      updateData.metadata = metadata;
    }

    await this.notificationModel
      .findByIdAndUpdate(notificationId, updateData)
      .exec();
  }

  async updateStats(
    notificationId: string,
    stats: {
      targetCount?: number;
      sentCount?: number;
      deliveredCount?: number;
      failedCount?: number;
      openedCount?: number;
      clickedCount?: number;
    },
  ): Promise<void> {
    const updateData: UpdateQuery<NotificationDocument> = {};

    Object.entries(stats).forEach(([key, value]) => {
      if (value !== undefined) {
        updateData[key] = value;
      }
    });

    await this.notificationModel
      .findByIdAndUpdate(notificationId, updateData)
      .exec();
  }

  async incrementStats(
    notificationId: string,
    stat:
      | 'sentCount'
      | 'deliveredCount'
      | 'failedCount'
      | 'openedCount'
      | 'clickedCount',
    count = 1,
  ): Promise<void> {
    await this.notificationModel
      .findByIdAndUpdate(notificationId, {
        $inc: { [stat]: count },
      })
      .exec();
  }

  async getStats(projectId: string, days = 30): Promise<any> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const stats = await this.notificationModel.aggregate([
      {
        $match: {
          projectId: new Types.ObjectId(projectId),
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          sent: { $sum: '$sentCount' },
          delivered: { $sum: '$deliveredCount' },
          failed: { $sum: '$failedCount' },
          opened: { $sum: '$openedCount' },
          clicked: { $sum: '$clickedCount' },
          byStatus: {
            $push: {
              status: '$status',
              count: 1,
            },
          },
          byType: {
            $push: {
              type: '$type',
              count: 1,
            },
          },
        },
      },
    ]);

    return (
      stats[0] || {
        total: 0,
        sent: 0,
        delivered: 0,
        failed: 0,
        opened: 0,
        clicked: 0,
        byStatus: {},
        byType: {},
      }
    );
  }

  async addError(notificationId: string, error: string): Promise<void> {
    await this.notificationModel
      .findByIdAndUpdate(notificationId, {
        $push: { processingErrors: error },
      })
      .exec();
  }

  async getScheduledNotifications(beforeDate?: Date): Promise<Notification[]> {
    const query: FilterQuery<NotificationDocument> = {
      type: NotificationType.SCHEDULED,
      status: NotificationStatus.PENDING,
      scheduledFor: { $lte: beforeDate || new Date() },
    };

    return this.notificationModel.find(query).select('-__v').exec();
  }

  async getRecurringNotifications(): Promise<Notification[]> {
    return this.notificationModel
      .find({
        type: NotificationType.RECURRING,
        status: { $ne: NotificationStatus.CANCELLED },
        $or: [
          { 'recurring.endDate': { $exists: false } },
          { 'recurring.endDate': { $gte: new Date() } },
        ],
      })
      .select('-__v')
      .exec();
  }
}
