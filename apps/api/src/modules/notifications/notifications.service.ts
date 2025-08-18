import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification, NotificationDocument, NotificationStatus, NotificationType } from './schemas/notification.schema';
import { SendNotificationDto } from './dto/send-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
  ) {}

  async send(projectId: string, sendNotificationDto: SendNotificationDto): Promise<Notification> {
    // Validate targeting
    const hasTargeting = 
      sendNotificationDto.targetDevices?.length ||
      sendNotificationDto.targetTags?.length ||
      sendNotificationDto.targetTopics?.length ||
      sendNotificationDto.targetQuery;

    if (!hasTargeting) {
      throw new BadRequestException('At least one targeting method must be specified');
    }

    // Validate scheduling
    if (sendNotificationDto.type === NotificationType.SCHEDULED && !sendNotificationDto.scheduledFor) {
      throw new BadRequestException('Scheduled notifications must have a scheduledFor date');
    }

    if (sendNotificationDto.type === NotificationType.RECURRING && !sendNotificationDto.recurring) {
      throw new BadRequestException('Recurring notifications must have recurring configuration');
    }

    // Create notification
    const notification = new this.notificationModel({
      projectId: new Types.ObjectId(projectId),
      ...sendNotificationDto,
      targetDevices: sendNotificationDto.targetDevices?.map(id => new Types.ObjectId(id)),
      templateId: sendNotificationDto.templateId ? new Types.ObjectId(sendNotificationDto.templateId) : undefined,
      scheduledFor: sendNotificationDto.scheduledFor ? new Date(sendNotificationDto.scheduledFor) : undefined,
      expiresAt: sendNotificationDto.expiresAt ? new Date(sendNotificationDto.expiresAt) : undefined,
      recurring: sendNotificationDto.recurring ? {
        ...sendNotificationDto.recurring,
        endDate: sendNotificationDto.recurring.endDate ? new Date(sendNotificationDto.recurring.endDate) : undefined,
      } : undefined,
    });

    const savedNotification = await notification.save();

    // TODO: Add to queue for processing
    // await this.queueService.addNotificationJob(savedNotification._id);

    return savedNotification;
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
    const query: any = { projectId: new Types.ObjectId(projectId) };

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

  async findOne(projectId: string, notificationId: string): Promise<Notification> {
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

  async cancel(projectId: string, notificationId: string): Promise<Notification> {
    const notification = await this.notificationModel
      .findOneAndUpdate(
        { 
          _id: notificationId, 
          projectId: new Types.ObjectId(projectId),
          status: { $in: [NotificationStatus.PENDING, NotificationStatus.PROCESSING] }
        },
        { 
          status: NotificationStatus.CANCELLED,
          completedAt: new Date(),
        },
        { new: true }
      )
      .select('-__v')
      .exec();
      
    if (!notification) {
      throw new NotFoundException('Notification not found or cannot be cancelled');
    }

    // TODO: Remove from queue if pending
    // await this.queueService.removeNotificationJob(notificationId);
    
    return notification;
  }

  async updateStatus(
    notificationId: string,
    status: NotificationStatus,
    metadata?: Record<string, any>,
  ): Promise<void> {
    const updateData: any = { status };

    if (status === NotificationStatus.PROCESSING) {
      updateData.processedAt = new Date();
    } else if (status === NotificationStatus.SENT) {
      updateData.sentAt = new Date();
    } else if ([NotificationStatus.DELIVERED, NotificationStatus.FAILED, NotificationStatus.CANCELLED].includes(status)) {
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
    const updateData: any = {};

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
    stat: 'sentCount' | 'deliveredCount' | 'failedCount' | 'openedCount' | 'clickedCount',
    count = 1,
  ): Promise<void> {
    await this.notificationModel
      .findByIdAndUpdate(notificationId, { 
        $inc: { [stat]: count } 
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
          createdAt: { $gte: startDate }
        } 
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
              count: 1
            }
          },
          byType: {
            $push: {
              type: '$type',
              count: 1
            }
          }
        }
      }
    ]);

    return stats[0] || { 
      total: 0, 
      sent: 0, 
      delivered: 0, 
      failed: 0, 
      opened: 0, 
      clicked: 0,
      byStatus: {},
      byType: {}
    };
  }

  async addError(notificationId: string, error: string): Promise<void> {
    await this.notificationModel
      .findByIdAndUpdate(notificationId, { 
        $push: { errors: error } 
      })
      .exec();
  }

  async getScheduledNotifications(beforeDate?: Date): Promise<Notification[]> {
    const query: any = {
      type: NotificationType.SCHEDULED,
      status: NotificationStatus.PENDING,
      scheduledFor: { $lte: beforeDate || new Date() },
    };

    return this.notificationModel
      .find(query)
      .select('-__v')
      .exec();
  }

  async getRecurringNotifications(): Promise<Notification[]> {
    return this.notificationModel
      .find({
        type: NotificationType.RECURRING,
        status: { $ne: NotificationStatus.CANCELLED },
        $or: [
          { 'recurring.endDate': { $exists: false } },
          { 'recurring.endDate': { $gte: new Date() } }
        ]
      })
      .select('-__v')
      .exec();
  }
}