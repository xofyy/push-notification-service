import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger, Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { BatchJobData } from '../queue.service';
import { QueueService } from '../queue.service';

@Injectable()
@Processor('batch-queue')
export class BatchNotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(BatchNotificationProcessor.name);

  constructor(
    private readonly queueService: QueueService,
  ) {
    super();
  }

  async process(job: Job<BatchJobData>): Promise<any> {
    const { 
      projectId, 
      notifications, 
      batchSize = 100, 
      delayBetweenBatches = 1000 
    } = job.data;
    
    this.logger.log(
      `Processing batch notification job ${job.id} for project ${projectId} with ${notifications.length} notifications`,
    );

    try {
      const results = {
        jobId: job.id,
        projectId,
        totalNotifications: notifications.length,
        processedNotifications: 0,
        successfulBatches: 0,
        failedBatches: 0,
        batchResults: [] as any[],
        startTime: new Date(),
        endTime: null as Date | null,
      };

      // Update initial progress
      await job.updateProgress(5);

      // Process notifications in batches
      const batches = this.createBatches(notifications, batchSize);
      
      this.logger.log(
        `Split ${notifications.length} notifications into ${batches.length} batches of max ${batchSize} each`,
      );

      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        const batchId = `${job.id}-batch-${batchIndex + 1}`;

        try {
          this.logger.log(
            `Processing batch ${batchIndex + 1}/${batches.length} with ${batch.length} notifications`,
          );

          // Process batch concurrently
          const batchJobPromises = batch.map((notification, notificationIndex) => 
            this.queueService.addNotificationJob(
              notification,
              {
                priority: 7, // Lower priority for batch jobs
                jobId: `${batchId}-notification-${notificationIndex + 1}`,
              },
            )
          );

          const batchJobs = await Promise.allSettled(batchJobPromises);

          // Analyze batch results
          const batchResult = {
            batchIndex: batchIndex + 1,
            batchId,
            notificationCount: batch.length,
            successCount: batchJobs.filter(result => result.status === 'fulfilled').length,
            failureCount: batchJobs.filter(result => result.status === 'rejected').length,
            jobIds: batchJobs
              .filter(result => result.status === 'fulfilled')
              .map(result => (result as PromiseFulfilledResult<any>).value.id),
            errors: batchJobs
              .filter(result => result.status === 'rejected')
              .map(result => (result as PromiseRejectedResult).reason.message),
            timestamp: new Date(),
          };

          results.batchResults.push(batchResult);
          results.processedNotifications += batch.length;
          
          if (batchResult.successCount > 0) {
            results.successfulBatches++;
          }
          if (batchResult.failureCount > 0) {
            results.failedBatches++;
          }

          // Update progress
          const progress = Math.round(((batchIndex + 1) / batches.length) * 90) + 5;
          await job.updateProgress(progress);

          this.logger.log(
            `Completed batch ${batchIndex + 1}/${batches.length}: ${batchResult.successCount} success, ${batchResult.failureCount} failed`,
          );

          // Add delay between batches (except for the last batch)
          if (batchIndex < batches.length - 1 && delayBetweenBatches > 0) {
            await this.delay(delayBetweenBatches);
          }

        } catch (batchError) {
          this.logger.error(
            `Failed to process batch ${batchIndex + 1}: ${batchError.message}`,
            batchError.stack,
          );

          results.failedBatches++;
          results.batchResults.push({
            batchIndex: batchIndex + 1,
            batchId,
            notificationCount: batch.length,
            successCount: 0,
            failureCount: batch.length,
            jobIds: [],
            errors: [batchError.message],
            timestamp: new Date(),
          });
        }
      }

      results.endTime = new Date();
      
      // Update job progress to complete
      await job.updateProgress(100);

      const duration = results.endTime.getTime() - results.startTime.getTime();
      
      this.logger.log(
        `Completed batch job ${job.id}: processed ${results.processedNotifications}/${results.totalNotifications} notifications in ${duration}ms`,
      );

      return {
        status: 'completed',
        ...results,
        summary: {
          totalBatches: batches.length,
          successfulBatches: results.successfulBatches,
          failedBatches: results.failedBatches,
          successRate: batches.length > 0 ? (results.successfulBatches / batches.length) * 100 : 0,
          duration: duration,
          averageBatchTime: duration / batches.length,
        },
      };

    } catch (error) {
      this.logger.error(
        `Failed to process batch notification job ${job.id}: ${error.message}`,
        error.stack,
      );

      throw error;
    }
  }

  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    
    return batches;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}