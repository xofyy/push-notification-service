import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FCMService } from '../fcm';
import { APNsService } from '../apns';
import { WebPushService } from '../webpush';
import type { WebPushSubscription } from '../webpush/webpush.service';
import {
  RetryService,
  ErrorClassifierService,
  ErrorCategory,
} from '../../common/error-handling';
import {
  PushProvider,
  UnifiedNotificationPayload,
  NotificationTarget,
  UnifiedSendResult,
  PlatformType,
} from '../../common/interfaces/push-provider.interface';

export interface UnifiedSendOptions {
  payload: UnifiedNotificationPayload;
  targets: NotificationTarget[];
  dryRun?: boolean;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private providers: Record<PlatformType, PushProvider>;

  constructor(
    private readonly configService: ConfigService,
    private readonly fcmService: FCMService,
    private readonly apnsService: APNsService,
    private readonly webPushService: WebPushService,
    private readonly retryService: RetryService,
    private readonly errorClassifier: ErrorClassifierService,
  ) {
    this.providers = {
      [PlatformType.ANDROID]: this.fcmService,
      [PlatformType.IOS]: this.apnsService,
      [PlatformType.WEB]: this.webPushService,
    };
  }

  async sendUnifiedWithRetry(
    options: UnifiedSendOptions,
  ): Promise<UnifiedSendResult> {
    const retryResult = await this.retryService.executeWithRetry(
      () => this.sendUnified(options),
      {
        maxAttempts: 3,
        baseDelay: 1000,
        maxDelay: 10000,
      },
    );

    if (retryResult.success) {
      return retryResult.result!;
    }

    // If retry failed, classify the error and return a structured result
    const classifiedError = this.errorClassifier.classifyError(
      retryResult.error!,
      'unified-send',
    );

    this.logger.error(
      `Unified send failed after ${retryResult.attempts} attempts:`,
      {
        error: classifiedError,
        duration: retryResult.totalDuration,
      },
    );

    return {
      success: false,
      totalTargets: options.targets.length,
      successCount: 0,
      failureCount: options.targets.length,
      retryableFailures: classifiedError.shouldRetry
        ? options.targets.length
        : 0,
      results: options.targets.map((target) => ({
        platform: target.platform,
        target,
        success: false,
        error: classifiedError.description,
        errorCategory: classifiedError.category,
        shouldRetry: classifiedError.shouldRetry,
        attempts: retryResult.attempts,
      })),
    };
  }

  async sendUnified(options: UnifiedSendOptions): Promise<UnifiedSendResult> {
    const { payload, targets, dryRun = false } = options;
    const results: UnifiedSendResult['results'] = [];

    // Group targets by platform
    const platformGroups = this.groupTargetsByPlatform(targets);

    // Send to each platform concurrently
    const platformPromises = Object.entries(platformGroups).map(
      async ([platform, platformTargets]) => {
        try {
          return await this.sendToPlatform(
            platform as PlatformType,
            payload,
            platformTargets,
            dryRun,
          );
        } catch (error) {
          this.logger.error(
            `Failed to send to platform ${platform}:`,
            error.message,
          );
          // Return failed results for all targets in this platform
          return platformTargets.map((target) => ({
            platform: platform as PlatformType,
            target,
            success: false,
            error: error.message,
            shouldRetry: false,
          }));
        }
      },
    );

    const platformResults = await Promise.all(platformPromises);
    results.push(...platformResults.flat());

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.length - successCount;
    const retryableFailures = results.filter(
      (r) => !r.success && r.shouldRetry,
    ).length;

    return {
      success: successCount > 0,
      totalTargets: targets.length,
      successCount,
      failureCount,
      retryableFailures,
      results,
    };
  }

  private groupTargetsByPlatform(
    targets: NotificationTarget[],
  ): Record<PlatformType, NotificationTarget[]> {
    const groups: Record<PlatformType, NotificationTarget[]> = {
      [PlatformType.IOS]: [],
      [PlatformType.ANDROID]: [],
      [PlatformType.WEB]: [],
    };

    targets.forEach((target) => {
      if (groups[target.platform]) {
        groups[target.platform].push(target);
      }
    });

    return groups;
  }

  private async sendToPlatform(
    platform: PlatformType,
    payload: UnifiedNotificationPayload,
    targets: NotificationTarget[],
    dryRun: boolean,
  ): Promise<UnifiedSendResult['results']> {
    const provider = this.providers[platform];
    if (!provider) {
      throw new Error(`Unsupported platform: ${platform}`);
    }
    return provider.send(payload, targets, dryRun);
  }

  getAvailablePlatforms(): PlatformType[] {
    const platforms: PlatformType[] = [];

    if (this.fcmService.getStatus().available) {
      platforms.push(PlatformType.ANDROID);
    }

    if (this.apnsService.getStatus().available) {
      platforms.push(PlatformType.IOS);
    }

    if (this.webPushService.getStatus().available) {
      platforms.push(PlatformType.WEB);
    }

    return platforms;
  }

  getServiceStatus() {
    return {
      available: this.getAvailablePlatforms().length > 0,
      platforms: {
        [PlatformType.ANDROID]: this.fcmService.getStatus(),
        [PlatformType.IOS]: this.apnsService.getStatus(),
        [PlatformType.WEB]: this.webPushService.getStatus(),
      },
      availablePlatforms: this.getAvailablePlatforms(),
    };
  }


}
