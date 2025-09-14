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

export enum PlatformType {
  IOS = 'ios',
  ANDROID = 'android',
  WEB = 'web',
}

export interface UnifiedNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, unknown>;
  imageUrl?: string;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  badge?: number;
  sound?: string;
  category?: string;
  priority?: 'high' | 'normal';
  ttl?: number;
}

export interface NotificationTarget {
  platform: PlatformType;
  token?: string;
  tokens?: string[];
  topic?: string;
  subscription?: unknown; // For web push subscriptions
}

export interface UnifiedSendOptions {
  payload: UnifiedNotificationPayload;
  targets: NotificationTarget[];
  dryRun?: boolean;
}

export interface UnifiedSendResult {
  success: boolean;
  totalTargets: number;
  successCount: number;
  failureCount: number;
  retryableFailures: number;
  results: Array<{
    platform: PlatformType;
    target: NotificationTarget;
    success: boolean;
    messageId?: string;
    error?: string;
    errorCategory?: ErrorCategory;
    shouldRetry?: boolean;
    invalidTarget?: boolean;
    attempts?: number;
  }>;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly fcmService: FCMService,
    private readonly apnsService: APNsService,
    private readonly webPushService: WebPushService,
    private readonly retryService: RetryService,
    private readonly errorClassifier: ErrorClassifierService,
  ) {}

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
    switch (platform) {
      case PlatformType.ANDROID:
        return this.sendToFCM(payload, targets, dryRun);
      case PlatformType.IOS:
        return this.sendToAPNs(payload, targets, dryRun);
      case PlatformType.WEB:
        return this.sendToWebPush(payload, targets, dryRun);
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }

  private async sendToFCM(
    payload: UnifiedNotificationPayload,
    targets: NotificationTarget[],
    dryRun: boolean,
  ): Promise<UnifiedSendResult['results']> {
    if (!this.fcmService.getStatus().available) {
      return targets.map((target) => ({
        platform: PlatformType.ANDROID,
        target,
        success: false,
        error: 'FCM service not available',
        shouldRetry: false,
      }));
    }

    // Handle single or multiple tokens
    const tokens = targets
      .map((t) => t.token)
      .filter((token): token is string => Boolean(token));

    if (tokens.length > 0) {
      const result = await this.fcmService.sendToMultipleDevices({
        tokens,
        payload: {
          title: payload.title,
          body: payload.body,
          data: this.toStringRecord(payload.data),
          imageUrl: payload.imageUrl,
        },
        priority: payload.priority,
        dryRun,
      });

      return result.results.map((r, index) => ({
        platform: PlatformType.ANDROID,
        target: targets[index],
        success: r.success,
        messageId: r.messageId,
        error: r.error,
        shouldRetry: r.shouldRetry,
        invalidTarget: r.invalidToken,
      }));
    }

    // Handle topic-based sending
    const topicTargets = targets.filter((t) => t.topic);
    const topicResults: UnifiedSendResult['results'] = [];

    for (const target of topicTargets) {
      try {
        await this.fcmService.sendToTopic(
          target.topic!,
          {
            title: payload.title,
            body: payload.body,
            data: this.toStringRecord(payload.data),
            imageUrl: payload.imageUrl,
          },
          {
            priority: payload.priority,
            dryRun,
          },
        );

        topicResults.push({
          platform: PlatformType.ANDROID,
          target,
          success: true,
        });
      } catch (error) {
        topicResults.push({
          platform: PlatformType.ANDROID,
          target,
          success: false,
          error: error.message,
          shouldRetry: true, // Topic sends can generally be retried
        });
      }
    }

    return topicResults;
  }

  private async sendToAPNs(
    payload: UnifiedNotificationPayload,
    targets: NotificationTarget[],
    dryRun: boolean,
  ): Promise<UnifiedSendResult['results']> {
    if (!this.apnsService.getStatus().available) {
      return targets.map((target) => ({
        platform: PlatformType.IOS,
        target,
        success: false,
        error: 'APNs service not available',
        shouldRetry: false,
      }));
    }

    // Handle single token
    if (targets.length === 1 && targets[0].token) {
      const result = await this.apnsService.sendToSingleDevice(
        targets[0].token,
        {
          title: payload.title,
          body: payload.body,
          data: payload.data,
          badge: payload.badge,
          sound: payload.sound,
          category: payload.category,
        },
      );

      return [
        {
          platform: PlatformType.IOS,
          target: targets[0],
          success: result.success,
          messageId: result.results[0]?.messageId,
          error: result.results[0]?.error,
          shouldRetry: result.results[0]?.shouldRetry,
          invalidTarget: result.results[0]?.invalidToken,
        },
      ];
    }

    // Handle multiple tokens
    const tokens = targets
      .map((t) => t.token)
      .filter((token): token is string => Boolean(token));

    if (tokens.length > 0) {
      const result = await this.apnsService.sendToMultipleDevices({
        tokens,
        payload: {
          title: payload.title,
          body: payload.body,
          data: payload.data,
          badge: payload.badge,
          sound: payload.sound,
          category: payload.category,
        },
      });

      return result.results.map((r, index) => ({
        platform: PlatformType.IOS,
        target: targets[index],
        success: r.success,
        messageId: r.messageId,
        error: r.error,
        shouldRetry: r.shouldRetry,
        invalidTarget: r.invalidToken,
      }));
    }

    return [];
  }

  private async sendToWebPush(
    payload: UnifiedNotificationPayload,
    targets: NotificationTarget[],
    dryRun: boolean,
  ): Promise<UnifiedSendResult['results']> {
    if (!this.webPushService.getStatus().available) {
      return targets.map((target) => ({
        platform: PlatformType.WEB,
        target,
        success: false,
        error: 'Web Push service not available',
        shouldRetry: false,
      }));
    }

    // Handle subscriptions
    const subscriptions = targets
      .map((t) => t.subscription)
      .filter((sub) => Boolean(sub)) as WebPushSubscription[];

    if (subscriptions.length > 0) {
      const result = await this.webPushService.sendToMultipleSubscriptions({
        subscriptions,
        payload: {
          title: payload.title,
          body: payload.body,
          data: payload.data,
          image: payload.imageUrl,
          actions: payload.actions,
          badge: payload.badge?.toString(),
        },
        options: {
          ttl: payload.ttl,
        },
      });

      return result.results.map((r, index) => ({
        platform: PlatformType.WEB,
        target: targets[index],
        success: r.success,
        error: r.error,
        shouldRetry: r.shouldRetry,
        invalidTarget: r.invalidSubscription,
      }));
    }

    return [];
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

  private toStringRecord(input?: Record<string, unknown>): Record<string, string> | undefined {
    if (!input) return undefined;
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(input)) {
      out[k] = v === undefined || v === null ? '' : String(v);
    }
    return out;
  }
}
