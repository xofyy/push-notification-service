import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger, Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { RecurringJobData } from '../queue.service';
import { QueueService } from '../queue.service';

@Injectable()
@Processor('recurring-queue')
export class RecurringNotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(RecurringNotificationProcessor.name);

  constructor(private readonly queueService: QueueService) {
    super();
  }

  async process(job: Job<RecurringJobData>): Promise<any> {
    const {
      projectId,
      payload,
      targeting,
      options,
      schedule,
      startDate,
      endDate,
      maxExecutions,
    } = job.data;

    this.logger.log(
      `Processing recurring notification job ${job.id} for project ${projectId}`,
    );

    try {
      // Update job progress
      await job.updateProgress(10);

      // Check if we're within the execution window
      const now = new Date();

      if (startDate && now < new Date(startDate)) {
        this.logger.warn(
          `Recurring job ${job.id} executed before start date. Start: ${startDate}, Current: ${now}`,
        );
        return this.createSkippedResult(
          job.id!,
          projectId,
          'before_start_date',
          now,
        );
      }

      if (endDate && now > new Date(endDate)) {
        this.logger.log(
          `Recurring job ${job.id} has passed end date. Removing from schedule.`,
        );

        // Remove the recurring job
        await job.remove();

        return this.createSkippedResult(
          job.id!,
          projectId,
          'past_end_date',
          now,
        );
      }

      // Check execution count if maxExecutions is set
      if (maxExecutions && job.opts.repeat) {
        const executionCount = await this.getExecutionCount(job);

        if (executionCount >= maxExecutions) {
          this.logger.log(
            `Recurring job ${job.id} has reached max executions (${maxExecutions}). Removing from schedule.`,
          );

          // Remove the recurring job
          await job.remove();

          return this.createSkippedResult(
            job.id!,
            projectId,
            'max_executions_reached',
            now,
          );
        }
      }

      // Update job progress
      await job.updateProgress(30);

      // Create notification data with recurring context
      const notificationData = {
        projectId,
        payload,
        targeting,
        options: {
          ...options,
          metadata: {
            ...options?.metadata,
            recurringJobId: job.id,
            executionTime: now.toISOString(),
            scheduleType: schedule.type,
            scheduleValue: schedule.value,
            timezone: schedule.timezone,
          },
        },
      };

      // Update job progress
      await job.updateProgress(50);

      // Add to immediate notification queue
      const notificationJob = await this.queueService.addNotificationJob(
        notificationData,
        {
          priority: 5, // Normal priority for recurring notifications
          jobId: `recurring-${job.id}-${Date.now()}`,
        },
      );

      // Update job progress
      await job.updateProgress(80);

      // Record execution
      await this.recordExecution(job.id!, projectId, now, notificationJob.id!);

      this.logger.log(
        `Recurring job ${job.id} created notification job ${notificationJob.id}`,
      );

      // Update job progress to complete
      await job.updateProgress(100);

      const executionCount = await this.getExecutionCount(job);

      return {
        jobId: job.id,
        projectId,
        status: 'completed',
        executionTime: now,
        notificationJobId: notificationJob.id,
        executionCount: executionCount + 1,
        schedule: {
          type: schedule.type,
          value: schedule.value,
          timezone: schedule.timezone,
        },
        nextExecution: await this.getNextExecutionTime(job),
        timestamp: new Date(),
      };
    } catch (error) {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      this.logger.error(
        `Failed to process recurring notification job ${job.id}: ${errorObj.message}`,
        errorObj.stack,
      );

      // Record failure
      await this.recordFailure(job.id!, projectId, errorObj, new Date());

      throw errorObj;
    }
  }

  private createSkippedResult(
    jobId: string,
    projectId: string,
    reason: string,
    timestamp: Date,
  ) {
    return {
      jobId,
      projectId,
      status: 'skipped',
      reason,
      timestamp,
    };
  }

  private async getExecutionCount(job: Job): Promise<number> {
    // This would typically query a database to get the actual execution count
    // For now, we'll use a simple approach based on job repeat count
    // In a real implementation, you'd store execution history in the database

    try {
      // BullMQ doesn't provide direct access to execution count for repeating jobs
      // We'll implement a simple counter using job metadata or database
      const metadata = job.data.options?.metadata || {};
      return metadata.executionCount || 0;
    } catch (error) {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      this.logger.error(
        `Failed to get execution count for job ${job.id}: ${errorObj.message}`,
      );
      return 0;
    }
  }

  private async getNextExecutionTime(job: Job): Promise<Date | null> {
    try {
      // Calculate next execution time based on schedule
      const { schedule } = job.data;
      const now = new Date();

      if (schedule.type === 'interval') {
        const interval = schedule.value as number;
        return new Date(now.getTime() + interval);
      } else if (schedule.type === 'cron') {
        // For cron expressions, we'd typically use a cron parser
        // For now, return null (would need cron-parser package)
        return null;
      }

      return null;
    } catch (error) {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      this.logger.error(
        `Failed to calculate next execution time for job ${job.id}: ${errorObj.message}`,
      );
      return null;
    }
  }

  private async recordExecution(
    jobId: string,
    projectId: string,
    executionTime: Date,
    notificationJobId: string,
  ): Promise<void> {
    // Record successful execution in database for analytics
    this.logger.log(
      `Recording execution: Job ${jobId}, Project ${projectId}, Time ${executionTime}, Notification Job ${notificationJobId}`,
    );

    // This would integrate with a recurring job execution tracking service
    // Store in database: recurring_job_executions table
  }

  private async recordFailure(
    jobId: string,
    projectId: string,
    error: Error,
    executionTime: Date,
  ): Promise<void> {
    // Record failed execution in database for debugging
    this.logger.error(
      `Recording failure: Job ${jobId}, Project ${projectId}, Time ${executionTime}, Error: ${error.message}`,
    );

    // This would integrate with a failure tracking service
    // Store in database: recurring_job_failures table
  }
}
