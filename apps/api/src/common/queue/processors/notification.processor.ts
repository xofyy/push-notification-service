import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger, Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { NotificationJobData } from '../queue.service';
import { NotificationService } from '../../../providers/notification/notification.service';

@Injectable()
@Processor('notification-queue')
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    private readonly notificationService: NotificationService,
  ) {
    super();
  }

  async process(job: Job<NotificationJobData>): Promise<any> {
    const { projectId, payload, targeting, options = {} } = job.data;
    
    this.logger.log(
      `Processing notification job ${job.id} for project ${projectId}`,
    );

    try {
      // Update job progress
      await job.updateProgress(10);

      // Prepare unified send options
      const unifiedOptions = {
        payload: {
          ...payload,
          priority: payload.priority === 'low' ? 'normal' : payload.priority,
        },
        targets: [] as Array<{
          platform: any;
          token?: string;
          tokens?: string[];
          topic?: string;
          subscription?: any;
        }>,
        dryRun: options.dryRun || false,
      };

      // Update job progress
      await job.updateProgress(25);

      // Handle different targeting methods
      if (targeting.deviceIds?.length) {
        // For now, assume these are tokens - would need to query device collection to get platform
        this.logger.warn('Direct device ID targeting not fully implemented, treating as Android tokens');
        unifiedOptions.targets = targeting.deviceIds.map(deviceId => ({
          platform: 'android',
          token: deviceId,
        }));
      } else if (targeting.segment) {
        // Segment targeting - get device tokens from segment query
        const segmentResult = await this.getDevicesBySegment(projectId, targeting.segment);
        unifiedOptions.targets = segmentResult.map(device => ({
          platform: device.platform,
          token: device.token,
        }));
      } else if (targeting.topics?.length) {
        // Topic targeting - FCM supports topics
        unifiedOptions.targets = targeting.topics.map(topic => ({
          platform: 'android',
          topic: topic,
        }));
      }

      // Update job progress
      await job.updateProgress(50);

      if (unifiedOptions.targets.length === 0) {
        throw new Error('No valid targets found for notification');
      }

      // Send notification using unified service
      const result = await this.notificationService.sendUnified(unifiedOptions);

      // Update job progress
      await job.updateProgress(90);

      // Store delivery results if tracking is enabled
      if (options.trackDelivery) {
        await this.storeDeliveryResults(projectId, job.id!, result, options.metadata);
      }

      // Update job progress to complete
      await job.updateProgress(100);

      this.logger.log(
        `Completed notification job ${job.id}: success=${result.successCount}/${result.totalTargets}`,
      );

      return {
        jobId: job.id,
        projectId,
        status: 'completed',
        results: {
          totalTargets: result.totalTargets,
          successCount: result.successCount,
          failureCount: result.failureCount,
          deliveryRate: result.totalTargets > 0 ? (result.successCount / result.totalTargets) * 100 : 0,
          platformResults: result.results,
        },
        timestamp: new Date(),
      };

    } catch (error) {
      this.logger.error(
        `Failed to process notification job ${job.id}: ${error.message}`,
        error.stack,
      );

      // Determine if job should be retried based on error type
      const shouldRetry = this.shouldRetryJob(error);
      
      if (!shouldRetry) {
        // Mark job as failed permanently
        await job.moveToFailed(error, job.token!, false);
      }

      throw error;
    }
  }

  private async getDevicesBySegment(projectId: string, segment: any): Promise<Array<{ token: string; platform: string }>> {
    // This would integrate with DevicesService to get devices matching segment
    // For now, return empty array - will be implemented when DevicesService is integrated
    this.logger.warn('Segment targeting not yet fully implemented, returning empty results');
    return [];
  }

  private async storeDeliveryResults(
    projectId: string, 
    jobId: string, 
    result: any, 
    metadata?: Record<string, any>
  ): Promise<void> {
    // Store delivery results in database for analytics
    // This would integrate with a delivery tracking service
    this.logger.log(`Storing delivery results for job ${jobId} in project ${projectId}`);
  }

  private shouldRetryJob(error: any): boolean {
    // Don't retry for validation errors or permanent failures
    if (error.message?.includes('Invalid') || error.message?.includes('No valid targets')) {
      return false;
    }

    // Don't retry for authentication/authorization errors
    if (error.status === 401 || error.status === 403) {
      return false;
    }

    // Retry for network errors, rate limits, temporary failures
    return true;
  }
}