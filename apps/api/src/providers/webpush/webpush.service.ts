import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as webpush from 'web-push';

export interface WebPushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface WebPushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  image?: string;
  badge?: string;
  data?: Record<string, any>;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  tag?: string;
  renotify?: boolean;
  silent?: boolean;
  requireInteraction?: boolean;
  timestamp?: number;
  vibrate?: number[];
  sound?: string;
}

export interface WebPushSendOptions {
  subscriptions: WebPushSubscription[];
  payload: WebPushNotificationPayload;
  options?: {
    ttl?: number;
    urgency?: 'very-low' | 'low' | 'normal' | 'high';
    topic?: string;
    headers?: Record<string, string>;
  };
}

export interface WebPushSendResult {
  success: boolean;
  successCount: number;
  failureCount: number;
  results: {
    subscription: WebPushSubscription;
    success: boolean;
    statusCode?: number;
    error?: string;
    shouldRetry?: boolean;
    invalidSubscription?: boolean;
  }[];
}

@Injectable()
export class WebPushService implements OnModuleInit {
  private readonly logger = new Logger(WebPushService.name);
  private isInitialized = false;
  private vapidDetails: {
    publicKey: string;
    privateKey: string;
    subject: string;
  };

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    await this.initializeWebPush();
  }

  private async initializeWebPush(): Promise<void> {
    try {
      const publicKey = this.configService.get<string>(
        'pushProviders.webPush.vapidPublicKey',
      );
      const privateKey = this.configService.get<string>(
        'pushProviders.webPush.vapidPrivateKey',
      );
      const subject = this.configService.get<string>(
        'pushProviders.webPush.vapidSubject',
      );

      if (!publicKey || !privateKey || !subject) {
        this.logger.warn(
          'Web Push VAPID configuration not complete. Web Push will not be available.',
        );
        return;
      }

      this.vapidDetails = {
        publicKey,
        privateKey,
        subject,
      };

      // Set VAPID details for web-push library
      webpush.setVapidDetails(subject, publicKey, privateKey);

      this.isInitialized = true;
      this.logger.log('✅ Web Push service initialized successfully');
    } catch (error) {
      this.logger.error(
        '❌ Failed to initialize Web Push service:',
        error.message,
      );
      this.isInitialized = false;
    }
  }

  async sendToSingleSubscription(
    subscription: WebPushSubscription,
    payload: WebPushNotificationPayload,
    options: Partial<WebPushSendOptions> = {},
  ): Promise<WebPushSendResult> {
    return this.sendToMultipleSubscriptions({
      ...options,
      subscriptions: [subscription],
      payload,
    });
  }

  async sendToMultipleSubscriptions(
    options: WebPushSendOptions,
  ): Promise<WebPushSendResult> {
    if (!this.isInitialized) {
      throw new Error('Web Push service is not initialized');
    }

    const { subscriptions, payload, options: sendOptions } = options;

    if (!subscriptions || subscriptions.length === 0) {
      throw new Error('At least one subscription is required');
    }

    try {
      // Prepare the notification payload
      const notificationPayload = JSON.stringify({
        title: payload.title,
        body: payload.body,
        icon: payload.icon,
        image: payload.image,
        badge: payload.badge,
        data: payload.data || {},
        actions: payload.actions || [],
        tag: payload.tag,
        renotify: payload.renotify,
        silent: payload.silent,
        requireInteraction: payload.requireInteraction,
        timestamp: payload.timestamp || Date.now(),
        vibrate: payload.vibrate,
        sound: payload.sound,
      });

      // Prepare send options
      const webPushOptions: webpush.RequestOptions = {
        TTL: sendOptions?.ttl || 86400, // 24 hours default
        urgency: sendOptions?.urgency || 'normal',
        topic: sendOptions?.topic,
        headers: sendOptions?.headers || {},
      };

      // Send to all subscriptions
      const results = await Promise.allSettled(
        subscriptions.map(async (subscription) => {
          try {
            const result = await webpush.sendNotification(
              subscription,
              notificationPayload,
              webPushOptions,
            );
            return { subscription, result };
          } catch (error) {
            return { subscription, error };
          }
        }),
      );

      const sendResults = results.map((result, index) => {
        const subscription = subscriptions[index];

        if (result.status === 'fulfilled') {
          const webPushResult = result.value.result;

          if (
            webPushResult &&
            typeof webPushResult === 'object' &&
            'statusCode' in webPushResult
          ) {
            const statusCode = webPushResult.statusCode;

            if (statusCode >= 200 && statusCode < 300) {
              return {
                subscription,
                success: true,
                statusCode,
              };
            } else {
              const shouldRetry = this.shouldRetryError(statusCode);
              const invalidSubscription =
                this.isInvalidSubscriptionError(statusCode);

              return {
                subscription,
                success: false,
                statusCode,
                error: `HTTP ${statusCode}: ${webPushResult.body || 'Unknown error'}`,
                shouldRetry,
                invalidSubscription,
              };
            }
          }

          // If result doesn't have statusCode, assume success
          return {
            subscription,
            success: true,
            statusCode: 200,
          };
        } else {
          // Handle Promise rejection
          const error = result.reason;
          const statusCode = error?.statusCode;
          const shouldRetry = this.shouldRetryError(statusCode);
          const invalidSubscription =
            this.isInvalidSubscriptionError(statusCode);

          return {
            subscription,
            success: false,
            statusCode,
            error: error?.message || 'Unknown error',
            shouldRetry,
            invalidSubscription,
          };
        }
      });

      const successCount = sendResults.filter((r) => r.success).length;
      const failureCount = sendResults.filter((r) => !r.success).length;

      const sendResult: WebPushSendResult = {
        success: successCount > 0,
        successCount,
        failureCount,
        results: sendResults,
      };

      this.logger.log(
        `Web Push batch sent: ${successCount}/${subscriptions.length} successful`,
      );

      if (failureCount > 0) {
        const invalidSubscriptions = sendResults.filter(
          (r) => r.invalidSubscription,
        ).length;
        const retriableErrors = sendResults.filter((r) => r.shouldRetry).length;

        this.logger.warn(
          `Web Push failures: ${failureCount} total, ${invalidSubscriptions} invalid subscriptions, ${retriableErrors} retriable`,
        );
      }

      return sendResult;
    } catch (error) {
      this.logger.error('Web Push send error:', error.message);
      throw error;
    }
  }

  private shouldRetryError(statusCode?: number): boolean {
    if (!statusCode) return false;

    const retryableStatusCodes = [
      429, // Too Many Requests
      500, // Internal Server Error
      502, // Bad Gateway
      503, // Service Unavailable
      504, // Gateway Timeout
    ];
    return retryableStatusCodes.includes(statusCode);
  }

  private isInvalidSubscriptionError(statusCode?: number): boolean {
    if (!statusCode) return false;

    const invalidSubscriptionStatusCodes = [
      400, // Bad Request
      404, // Not Found
      410, // Gone (subscription expired)
      413, // Payload Too Large
    ];
    return invalidSubscriptionStatusCodes.includes(statusCode);
  }

  generateVAPIDKeys(): { publicKey: string; privateKey: string } {
    if (!this.isInitialized) {
      // We can still generate keys even if not initialized
      return webpush.generateVAPIDKeys();
    }
    return webpush.generateVAPIDKeys();
  }

  getVAPIDPublicKey(): string | null {
    if (!this.isInitialized || !this.vapidDetails) {
      return null;
    }
    return this.vapidDetails.publicKey;
  }

  isAvailable(): boolean {
    return this.isInitialized;
  }

  getStatus(): {
    available: boolean;
    publicKey?: string;
    subject?: string;
    canGenerateKeys: boolean;
  } {
    return {
      available: this.isInitialized,
      publicKey: this.vapidDetails?.publicKey,
      subject: this.vapidDetails?.subject,
      canGenerateKeys: true, // web-push library always allows key generation
    };
  }

  async validateSubscription(
    subscription: WebPushSubscription,
  ): Promise<boolean> {
    try {
      // Basic validation of subscription structure
      if (!subscription.endpoint || !subscription.keys) {
        return false;
      }

      if (!subscription.keys.p256dh || !subscription.keys.auth) {
        return false;
      }

      // Validate endpoint URL
      try {
        new URL(subscription.endpoint);
      } catch {
        return false;
      }

      // Validate base64 keys
      try {
        Buffer.from(subscription.keys.p256dh, 'base64url');
        Buffer.from(subscription.keys.auth, 'base64url');
      } catch {
        return false;
      }

      return true;
    } catch (error) {
      this.logger.warn('Subscription validation error:', error.message);
      return false;
    }
  }
}
