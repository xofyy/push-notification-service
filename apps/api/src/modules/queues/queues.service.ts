import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { QueueService } from '../../common/queue/queue.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/schemas/notification.schema';

export interface QueueJobDto {
  type: 'immediate' | 'scheduled' | 'batch' | 'recurring';
  projectId: string;
  payload: {
    title: string;
    body: string;
    imageUrl?: string;
    data?: Record<string, any>;
    actions?: Array<{ action: string; title: string; icon?: string }>;
    priority?: 'high' | 'normal' | 'low';
  };
  targeting: {
    deviceIds?: string[];
    segment?: any;
    topics?: string[];
  };
  options?: {
    dryRun?: boolean;
    trackDelivery?: boolean;
    metadata?: Record<string, any>;
  };
  schedule?: {
    sendAt?: string; // ISO date string for scheduled
    type?: 'interval' | 'cron'; // for recurring
    value?: string | number; // cron string or milliseconds
    timezone?: string;
    startDate?: string;
    endDate?: string;
    maxExecutions?: number;
  };
  batch?: {
    batchSize?: number;
    delayBetweenBatches?: number;
  };
}

@Injectable()
export class QueuesService {
  private readonly logger = new Logger(QueuesService.name);

  constructor(
    private readonly queueService: QueueService,
    private readonly notificationsService: NotificationsService,
  ) {
    this.logger.log('✅ Queue service initialized');
  }

  /**
   * Add a job to the appropriate queue based on type
   */
  async addJob(jobDto: QueueJobDto) {
    const { type, projectId, payload, targeting, options, schedule, batch } =
      jobDto;

    try {
      this.logger.log(`Adding ${type} job for project ${projectId}`);

      switch (type) {
        case 'immediate':
          return await this.queueService.addNotificationJob(
            { projectId, payload, targeting, options },
            { priority: this.getPriorityFromPayload(payload.priority) },
          );

        case 'scheduled':
          if (!schedule?.sendAt) {
            throw new Error('sendAt is required for scheduled jobs');
          }
          return await this.queueService.addScheduledJob(
            {
              projectId,
              payload,
              targeting,
              options,
              sendAt: new Date(schedule.sendAt),
              timezone: schedule.timezone,
            },
            { priority: this.getPriorityFromPayload(payload.priority) },
          );

        case 'batch':
          // For batch jobs, we expect an array of notifications in the payload
          const notifications = Array.isArray(payload)
            ? payload.map((p) => ({
                projectId,
                payload: p,
                targeting,
                options,
              }))
            : [{ projectId, payload, targeting, options }];

          return await this.queueService.addBatchJob(
            {
              projectId,
              notifications,
              batchSize: batch?.batchSize,
              delayBetweenBatches: batch?.delayBetweenBatches,
            },
            { priority: this.getPriorityFromPayload(payload.priority) },
          );

        case 'recurring':
          if (!schedule?.type || !schedule?.value) {
            throw new Error(
              'schedule type and value are required for recurring jobs',
            );
          }
          return await this.queueService.addRecurringJob(
            {
              projectId,
              payload,
              targeting,
              options,
              schedule: {
                type: schedule.type,
                value: schedule.value,
                timezone: schedule.timezone,
              },
              startDate: schedule.startDate
                ? new Date(schedule.startDate)
                : undefined,
              endDate: schedule.endDate
                ? new Date(schedule.endDate)
                : undefined,
              maxExecutions: schedule.maxExecutions,
            },
            { priority: this.getPriorityFromPayload(payload.priority) },
          );

        default:
          throw new Error(`Unknown job type: ${type}`);
      }
    } catch (error) {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Failed to add ${type} job: ${errorObj.message}`);

      // If Redis connection is failing, we could implement a fallback strategy
      if (
        errorObj.message?.includes('connect') ||
        errorObj.message?.includes('Connection')
      ) {
        this.logger.warn(
          'Redis connection issue detected. Queue job will be processed immediately as fallback.',
        );

        // For immediate jobs, execute directly without queue
        if (type === 'immediate') {
          try {
            const result = await this.notificationsService.send(projectId, {
              title: payload.title,
              body: payload.body,
              imageUrl: payload.imageUrl,
              data: payload.data,
              targetDevices: targeting.deviceIds,
              targetTags: targeting.segment?.tags?.tags,
              targetTopics: targeting.topics,
              type: NotificationType.INSTANT,
            });

            return {
              id: `direct-${Date.now()}`,
              name: 'direct-notification',
              data: { projectId, payload, targeting, options },
              opts: { priority: this.getPriorityFromPayload(payload.priority) },
              timestamp: new Date().toISOString(),
              processedOn: new Date().toISOString(),
              finishedOn: new Date().toISOString(),
              result,
            };
          } catch (directError) {
            const directErrorObj =
              directError instanceof Error
                ? directError
                : new Error(String(directError));
            this.logger.error(
              `Direct notification also failed: ${directErrorObj.message}`,
            );
            throw errorObj; // Throw original queue error
          }
        }
      }

      throw errorObj;
    }
  }

  /**
   * Get job status
   */
  async getJobStatus(queueName: string, jobId: string) {
    try {
      return await this.queueService.getJobStatus(queueName, jobId);
    } catch (error) {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Failed to get job status: ${errorObj.message}`);
      throw new NotFoundException(
        `Job ${jobId} not found in queue ${queueName}`,
      );
    }
  }

  /**
   * Cancel a job
   */
  async cancelJob(queueName: string, jobId: string) {
    try {
      const cancelled = await this.queueService.cancelJob(queueName, jobId);
      if (!cancelled) {
        throw new NotFoundException(
          `Job ${jobId} not found in queue ${queueName}`,
        );
      }
      return { success: true, message: `Job ${jobId} cancelled successfully` };
    } catch (error) {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Failed to cancel job: ${errorObj.message}`);
      throw errorObj;
    }
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(queueName?: string) {
    try {
      if (queueName) {
        return await this.queueService.getQueueStats(queueName);
      } else {
        return await this.queueService.getAllQueuesStats();
      }
    } catch (error) {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Failed to get queue stats: ${errorObj.message}`);
      throw errorObj;
    }
  }

  /**
   * Pause/Resume queue
   */
  async pauseQueue(queueName: string) {
    try {
      await this.queueService.pauseQueue(queueName);
      return {
        success: true,
        message: `Queue ${queueName} paused successfully`,
      };
    } catch (error) {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Failed to pause queue: ${errorObj.message}`);
      throw errorObj;
    }
  }

  async resumeQueue(queueName: string) {
    try {
      await this.queueService.resumeQueue(queueName);
      return {
        success: true,
        message: `Queue ${queueName} resumed successfully`,
      };
    } catch (error) {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Failed to resume queue: ${errorObj.message}`);
      throw errorObj;
    }
  }

  /**
   * Clean completed jobs (runs as cron job)
   */
  @Cron(CronExpression.EVERY_HOUR)
  async cleanCompletedJobs() {
    const queueNames = [
      'notification-queue',
      'scheduled-queue',
      'batch-queue',
      'recurring-queue',
    ];
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    this.logger.log('Starting scheduled cleanup of completed jobs');

    try {
      const results = await Promise.allSettled(
        queueNames.map((queueName) =>
          this.queueService.cleanQueue(queueName, maxAge),
        ),
      );

      let totalCleaned = 0;
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          totalCleaned += result.value.length;
          this.logger.log(
            `Cleaned ${result.value.length} jobs from ${queueNames[index]}`,
          );
        } else {
          this.logger.error(
            `Failed to clean ${queueNames[index]}: ${result.reason.message}`,
          );
        }
      });

      this.logger.log(
        `Completed job cleanup: ${totalCleaned} jobs cleaned across all queues`,
      );
    } catch (error) {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      this.logger.error(
        `Failed to clean completed jobs: ${errorObj.message}`,
        errorObj.stack,
      );
    }
  }

  /**
   * Health check for all queues
   */
  async getHealthStatus() {
    try {
      const stats = await this.queueService.getAllQueuesStats();
      const health = {
        status: 'healthy',
        timestamp: new Date(),
        queues: stats.map((stat) => ({
          name: stat.name,
          status: this.getQueueHealthStatus(stat),
          counts: stat.counts,
        })),
      };

      // Determine overall health
      const hasUnhealthyQueues = health.queues.some(
        (queue) => queue.status !== 'healthy',
      );
      if (hasUnhealthyQueues) {
        health.status = 'unhealthy';
      }

      return health;
    } catch (error) {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      this.logger.warn(`Queue health check failed: ${errorObj.message}`);

      // Return degraded status instead of error when Redis is unavailable
      if (
        errorObj.message?.includes('connect') ||
        errorObj.message?.includes('Connection')
      ) {
        return {
          status: 'degraded',
          timestamp: new Date(),
          message:
            'Queue system unavailable - using direct processing fallback',
          fallbackMode: true,
        };
      }

      return {
        status: 'error',
        timestamp: new Date(),
        error: errorObj.message,
      };
    }
  }

  private getPriorityFromPayload(priority?: string): number {
    switch (priority) {
      case 'high':
        return 3;
      case 'low':
        return 7;
      case 'normal':
      default:
        return 5;
    }
  }

  private getQueueHealthStatus(stat: any): string {
    // Simple health check logic
    const { counts } = stat;

    // If too many failed jobs, mark as unhealthy
    if (counts.failed > 100) {
      return 'unhealthy';
    }

    // If too many jobs are stuck in waiting state
    if (counts.waiting > 1000) {
      return 'degraded';
    }

    return 'healthy';
  }
}
