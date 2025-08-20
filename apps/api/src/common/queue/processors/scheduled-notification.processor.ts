import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger, Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { ScheduledJobData } from '../queue.service';
import { QueueService } from '../queue.service';

@Injectable()
@Processor('scheduled-queue')
export class ScheduledNotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(ScheduledNotificationProcessor.name);

  constructor(
    private readonly queueService: QueueService,
  ) {
    super();
  }

  async process(job: Job<ScheduledJobData>): Promise<any> {
    const { projectId, payload, targeting, options, sendAt, timezone } = job.data;
    
    this.logger.log(
      `Processing scheduled notification job ${job.id} for project ${projectId}, originally scheduled for ${sendAt}`,
    );

    try {
      // Update job progress
      await job.updateProgress(20);

      // Check if we're still within the scheduled time window
      const now = new Date();
      const scheduledTime = new Date(sendAt);
      const timeDifference = Math.abs(now.getTime() - scheduledTime.getTime());
      
      // Allow 5 minute tolerance for scheduled jobs
      const tolerance = 5 * 60 * 1000; // 5 minutes in milliseconds
      
      if (timeDifference > tolerance) {
        this.logger.warn(
          `Scheduled job ${job.id} is running ${Math.round(timeDifference / 1000)}s off schedule. Scheduled: ${scheduledTime}, Current: ${now}`,
        );
      }

      // Update job progress
      await job.updateProgress(40);

      // Convert scheduled job to immediate notification job
      const notificationData = {
        projectId,
        payload,
        targeting,
        options: {
          ...options,
          metadata: {
            ...options?.metadata,
            originalScheduledTime: sendAt,
            actualSendTime: now.toISOString(),
            timezone,
            scheduledJobId: job.id,
          },
        },
      };

      // Update job progress
      await job.updateProgress(60);

      // Add to immediate notification queue with high priority
      const notificationJob = await this.queueService.addNotificationJob(
        notificationData,
        {
          priority: 3, // High priority for scheduled notifications
          jobId: `scheduled-${job.id}-${Date.now()}`,
        },
      );

      // Update job progress
      await job.updateProgress(80);

      this.logger.log(
        `Scheduled job ${job.id} converted to notification job ${notificationJob.id}`,
      );

      // Update job progress to complete
      await job.updateProgress(100);

      return {
        jobId: job.id,
        projectId,
        status: 'completed',
        scheduledTime: sendAt,
        actualTime: now,
        timeDifference: timeDifference,
        notificationJobId: notificationJob.id,
        timestamp: new Date(),
      };

    } catch (error) {
      this.logger.error(
        `Failed to process scheduled notification job ${job.id}: ${error.message}`,
        error.stack,
      );

      // Store failure information for analysis
      await this.recordScheduledJobFailure(job.id!, projectId, error, sendAt);

      throw error;
    }
  }

  private async recordScheduledJobFailure(
    jobId: string,
    projectId: string, 
    error: any,
    originalScheduledTime: Date,
  ): Promise<void> {
    // Record failure for analytics and debugging
    this.logger.error(
      `Scheduled job failure recorded: Job ${jobId}, Project ${projectId}, Scheduled ${originalScheduledTime}, Error: ${error.message}`,
    );
    
    // This would integrate with a failure tracking service
    // For now, we just log the failure
  }
}