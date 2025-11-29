import { Injectable, Logger, Optional } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, Job, JobsOptions } from 'bullmq';

export enum QueuePriority {
  CRITICAL = 1,
  HIGH = 3,
  NORMAL = 5,
  LOW = 7,
  BULK = 10,
}

export enum JobType {
  NOTIFICATION = 'notification',
  SCHEDULED_NOTIFICATION = 'scheduled-notification',
  BATCH_NOTIFICATION = 'batch-notification',
  RECURRING_NOTIFICATION = 'recurring-notification',
  CLEANUP = 'cleanup',
}

export interface NotificationSegment {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'contains' | 'in';
  value: any;
}

export interface NotificationJobData {
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
    segment?: NotificationSegment[] | Record<string, any>;
    topics?: string[];
  };
  options?: {
    dryRun?: boolean;
    trackDelivery?: boolean;
    metadata?: Record<string, any>;
  };
}

export interface ScheduledJobData extends NotificationJobData {
  sendAt: Date;
  timezone?: string;
}

export interface BatchJobData {
  projectId: string;
  notifications: NotificationJobData[];
  batchSize?: number;
  delayBetweenBatches?: number;
}

export interface RecurringJobData extends NotificationJobData {
  schedule: {
    type: 'interval' | 'cron';
    value: string | number; // cron string or milliseconds
    timezone?: string;
  };
  startDate?: Date;
  endDate?: Date;
  maxExecutions?: number;
}

export interface JobStatus {
  status: string;
  progress?: number | object;
  data?: any;
  error?: string;
}

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  constructor(
    @Optional()
    @InjectQueue('notification-queue')
    private notificationQueue: Queue<NotificationJobData> | null,
    @Optional()
    @InjectQueue('scheduled-queue')
    private scheduledQueue: Queue<ScheduledJobData> | null,
    @Optional()
    @InjectQueue('batch-queue')
    private batchQueue: Queue<BatchJobData> | null,
    @Optional()
    @InjectQueue('recurring-queue')
    private recurringQueue: Queue<RecurringJobData> | null,
  ) {
    const isQueueEnabled = process.env.ENABLE_QUEUE_SYSTEM !== 'false';
    if (!isQueueEnabled) {
      this.logger.log(
        'Queue system disabled - using direct processing mode',
      );
    }
  }

  private createMockJob<T>(data: T, opts: JobsOptions, idPrefix: string): Job<T> {
    const timestamp = Date.now();
    return {
      id: `${idPrefix}-${timestamp}`,
      data,
      opts,
      returnvalue: null,
      attemptsMade: 0,
      processedOn: timestamp,
      finishedOn: timestamp,
      timestamp,
      name: 'mock-job',
      stacktrace: [],
      queueName: 'mock-queue',
      progress: 0,
      isActive: async () => false,
      isCompleted: async () => true,
      isFailed: async () => false,
      isDelayed: async () => false,
      isWaiting: async () => false,
      getState: async () => 'completed',
      updateProgress: async () => { },
      remove: async () => { },
      retry: async () => { },
      discard: async () => { },
      promote: async () => { },
      moveToCompleted: async () => [],
      moveToFailed: async () => [],
      update: async () => { },
      waitUntilFinished: async () => null,
    } as unknown as Job<T>;
  }

  /**
   * Add immediate notification job
   */
  async addNotificationJob(
    data: NotificationJobData,
    options: {
      priority?: QueuePriority;
      delay?: number;
      attempts?: number;
      jobId?: string;
    } = {},
  ): Promise<Job<NotificationJobData>> {
    if (!this.notificationQueue) {
      this.logger.warn('Queue system disabled - cannot add notification job');
      return this.createMockJob(data, options, 'mock');
    }

    const jobOptions: JobsOptions = {
      priority: options.priority || QueuePriority.NORMAL,
      delay: options.delay || 0,
      attempts: options.attempts || 3,
      jobId: options.jobId,
      removeOnComplete: true,
      removeOnFail: false,
    };

    this.logger.log(
      `Adding notification job for project ${data.projectId} with priority ${jobOptions.priority}`,
    );

    return this.notificationQueue.add(JobType.NOTIFICATION, data, jobOptions);
  }

  /**
   * Remove notification job
   */
  async removeNotificationJob(jobId: string): Promise<boolean> {
    if (!this.notificationQueue) {
      return false;
    }
    return this.cancelJob('notification-queue', jobId);
  }

  /**
   * Add scheduled notification job
   */
  async addScheduledJob(
    data: ScheduledJobData,
    options: { priority?: QueuePriority; jobId?: string } = {},
  ): Promise<Job<ScheduledJobData>> {
    if (!this.scheduledQueue) {
      this.logger.warn('Queue system disabled - cannot add scheduled job');
      return this.createMockJob(data, options, 'mock-scheduled');
    }

    const delay = data.sendAt.getTime() - Date.now();

    if (delay < 0) {
      throw new Error('Cannot schedule notification in the past');
    }

    const jobOptions: JobsOptions = {
      priority: options.priority || QueuePriority.NORMAL,
      delay,
      attempts: 3,
      jobId: options.jobId,
      removeOnComplete: true,
      removeOnFail: false,
    };

    this.logger.log(
      `Adding scheduled job for project ${data.projectId} to run at ${data.sendAt}`,
    );

    return this.scheduledQueue.add(
      JobType.SCHEDULED_NOTIFICATION,
      data,
      jobOptions,
    );
  }

  /**
   * Add batch notification job
   */
  async addBatchJob(
    data: BatchJobData,
    options: { priority?: QueuePriority; jobId?: string } = {},
  ): Promise<Job<BatchJobData>> {
    const jobOptions: JobsOptions = {
      priority: options.priority || QueuePriority.BULK,
      attempts: 2,
      jobId: options.jobId,
      removeOnComplete: true,
      removeOnFail: false,
    };

    this.logger.log(
      `Adding batch job for project ${data.projectId} with ${data.notifications.length} notifications`,
    );

    if (!this.batchQueue) {
      this.logger.warn('Queue system disabled - cannot add batch job');
      return this.createMockJob(data, options, 'mock-batch');
    }

    return this.batchQueue.add(JobType.BATCH_NOTIFICATION, data, jobOptions);
  }

  /**
   * Add recurring notification job
   */
  async addRecurringJob(
    data: RecurringJobData,
    options: { priority?: QueuePriority; jobId?: string } = {},
  ): Promise<Job<RecurringJobData>> {
    if (!this.recurringQueue) {
      this.logger.warn('Queue system disabled - cannot add recurring job');
      return this.createMockJob(data, options, 'mock-recurring');
    }

    const jobOptions: JobsOptions = {
      priority: options.priority || QueuePriority.NORMAL,
      repeat:
        data.schedule.type === 'cron'
          ? {
            pattern: data.schedule.value as string,
            tz: data.schedule.timezone,
          }
          : { every: data.schedule.value as number },
      jobId: options.jobId,
      removeOnComplete: 10,
      removeOnFail: 5,
    };

    // Add end date if specified
    if (data.endDate && jobOptions.repeat) {
      jobOptions.repeat.endDate = data.endDate;
    }

    this.logger.log(
      `Adding recurring job for project ${data.projectId} with schedule: ${JSON.stringify(data.schedule)}`,
    );

    return this.recurringQueue.add(
      JobType.RECURRING_NOTIFICATION,
      data,
      jobOptions,
    );
  }

  /**
   * Get job status
   */
  async getJobStatus(
    queueName: string,
    jobId: string,
  ): Promise<JobStatus> {
    const queue = this.getQueueByName(queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    const job = await queue.getJob(jobId);
    if (!job) {
      return { status: 'not-found' };
    }

    const state = await job.getState();
    return {
      status: state,
      progress: job.progress,
      data: job.data,
      error: job.failedReason,
    };
  }

  /**
   * Cancel a job
   */
  async cancelJob(queueName: string, jobId: string): Promise<boolean> {
    const queue = this.getQueueByName(queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    const job = await queue.getJob(jobId);
    if (!job) {
      return false;
    }

    await job.remove();
    this.logger.log(`Cancelled job ${jobId} from queue ${queueName}`);
    return true;
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(queueName: string) {
    const queue = this.getQueueByName(queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaiting(),
      queue.getActive(),
      queue.getCompleted(0, -1),
      queue.getFailed(0, -1),
      queue.getDelayed(),
    ]);

    return {
      name: queueName,
      counts: {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
        delayed: delayed.length,
      },
      jobs: {
        waiting: waiting.slice(0, 10).map((job) => ({
          id: job.id,
          name: job.name,
          data: job.data,
          opts: job.opts,
        })),
        active: active.slice(0, 10).map((job) => ({
          id: job.id,
          name: job.name,
          progress: job.progress,
        })),
        failed: failed.slice(0, 10).map((job) => ({
          id: job.id,
          name: job.name,
          error: job.failedReason,
        })),
      },
    };
  }

  /**
   * Get all queues statistics
   */
  async getAllQueuesStats() {
    const queueNames = [
      'notification-queue',
      'scheduled-queue',
      'batch-queue',
      'recurring-queue',
    ];
    const stats = await Promise.all(
      queueNames.map((name) => this.getQueueStats(name)),
    );
    return stats;
  }

  /**
   * Clean completed jobs
   */
  async cleanQueue(
    queueName: string,
    maxAge: number = 24 * 60 * 60 * 1000,
  ): Promise<string[]> {
    const queue = this.getQueueByName(queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    const jobs = await queue.clean(maxAge, 100, 'completed');
    this.logger.log(`Cleaned ${jobs.length} completed jobs from ${queueName}`);
    return jobs;
  }

  /**
   * Pause queue
   */
  async pauseQueue(queueName: string): Promise<void> {
    const queue = this.getQueueByName(queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    await queue.pause();
    this.logger.log(`Paused queue: ${queueName}`);
  }

  /**
   * Resume queue
   */
  async resumeQueue(queueName: string): Promise<void> {
    const queue = this.getQueueByName(queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    await queue.resume();
    this.logger.log(`Resumed queue: ${queueName}`);
  }

  private getQueueByName(name: string): Queue | null {
    switch (name) {
      case 'notification-queue':
        return this.notificationQueue;
      case 'scheduled-queue':
        return this.scheduledQueue;
      case 'batch-queue':
        return this.batchQueue;
      case 'recurring-queue':
        return this.recurringQueue;
      default:
        return null;
    }
  }
}
