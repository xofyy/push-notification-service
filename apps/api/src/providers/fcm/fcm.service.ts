import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { TokenMessage, TopicMessage } from 'firebase-admin/messaging';

export interface FCMNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
  clickAction?: string;
  badge?: number;
  sound?: string;
}

export interface FCMSendOptions {
  tokens: string[];
  payload: FCMNotificationPayload;
  priority?: 'high' | 'normal';
  timeToLive?: number;
  collapseKey?: string;
  dryRun?: boolean;
}

export interface FCMSendResult {
  success: boolean;
  successCount: number;
  failureCount: number;
  results: {
    token: string;
    success: boolean;
    messageId?: string;
    error?: string;
    shouldRetry?: boolean;
    invalidToken?: boolean;
  }[];
}

@Injectable()
export class FCMService implements OnModuleInit {
  private readonly logger = new Logger(FCMService.name);
  private app: admin.app.App;
  private messaging: admin.messaging.Messaging;
  private isInitialized = false;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    await this.initializeFirebase();
  }

  private async initializeFirebase(): Promise<void> {
    try {
      const serviceAccountKey = this.configService.get<string>(
        'fcm.serviceAccountKey',
      );
      const serviceAccountPath = this.configService.get<string>(
        'fcm.serviceAccountPath',
      );
      const projectId = this.configService.get<string>('fcm.projectId');
      const enabled = this.configService.get<boolean>('fcm.enabled');

      if (!enabled || (!serviceAccountPath && !serviceAccountKey)) {
        this.logger.warn(
          'FCM service account not configured. FCM will not be available.',
        );
        return;
      }

      let credential: admin.credential.Credential | undefined;

      if (serviceAccountKey) {
        // Use service account key from environment variable (for production)
        const serviceAccount = JSON.parse(serviceAccountKey);
        credential = admin.credential.cert(serviceAccount);
      } else if (serviceAccountPath) {
        // Use service account file path (for development)
        credential = admin.credential.cert(serviceAccountPath);
      }

      if (!credential) {
        throw new Error('No valid Firebase credentials provided');
      }

      // Initialize Firebase Admin
      this.app = admin.initializeApp({
        credential,
        projectId,
      });

      this.messaging = admin.messaging(this.app);
      this.isInitialized = true;

      this.logger.log('✅ FCM service initialized successfully');
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      this.logger.error('❌ Failed to initialize FCM service:', errorObj.message);
      // Don't throw error - just mark as not initialized
      this.isInitialized = false;
    }
  }

  async sendToSingleDevice(
    token: string,
    payload: FCMNotificationPayload,
    options: Partial<FCMSendOptions> = {},
  ): Promise<FCMSendResult> {
    return this.sendToMultipleDevices({ ...options, tokens: [token], payload });
  }

  async sendToMultipleDevices(options: FCMSendOptions): Promise<FCMSendResult> {
    if (!this.isInitialized) {
      throw new Error('FCM service is not initialized');
    }

    const {
      tokens,
      payload,
      priority = 'high',
      timeToLive,
      collapseKey,
      dryRun = false,
    } = options;

    if (!tokens || tokens.length === 0) {
      throw new Error('At least one token is required');
    }

    try {
      const androidPriority: 'high' | 'normal' =
        priority === 'high' ? 'high' : 'normal';

      // Send messages individually to avoid complex batch handling
      const results = await Promise.allSettled(
        tokens.map(async (token) => {
          const tokenMessage: TokenMessage = {
            token,
            notification: {
              title: payload.title,
              body: payload.body,
              imageUrl: payload.imageUrl,
            },
            data: payload.data || {},
            android: {
              priority: androidPriority,
              ttl: timeToLive ? timeToLive * 1000 : undefined,
              collapseKey,
              notification: {
                title: payload.title,
                body: payload.body,
                imageUrl: payload.imageUrl,
                clickAction: payload.clickAction,
                sound: payload.sound || 'default',
              },
            },
            apns: {
              headers: {
                'apns-priority': priority === 'high' ? '10' : '5',
                ...(timeToLive && {
                  'apns-expiration': (
                    Math.floor(Date.now() / 1000) + timeToLive
                  ).toString(),
                }),
                ...(collapseKey && { 'apns-collapse-id': collapseKey }),
              },
              payload: {
                aps: {
                  alert: {
                    title: payload.title,
                    body: payload.body,
                  },
                  badge: payload.badge,
                  sound: payload.sound || 'default',
                },
              },
            },
            webpush: {
              notification: {
                title: payload.title,
                body: payload.body,
                image: payload.imageUrl,
                badge: payload.badge?.toString(),
              },
              data: payload.data,
            },
          };

          const messageId = await this.messaging.send(tokenMessage, dryRun);
          return { token, messageId, success: true };
        }),
      );

      const sendResults = results.map((result, index) => {
        const token = tokens[index];

        if (result.status === 'fulfilled') {
          return {
            token,
            success: true,
            messageId: result.value.messageId,
          };
        } else {
          const reason = result.reason as { code?: string; message?: string } | undefined;
          const errorCode = reason?.code;
          const shouldRetry = this.shouldRetryError(errorCode);
          const invalidToken = this.isInvalidTokenError(errorCode);

          return {
            token,
            success: false,
            error: reason?.message || 'Unknown error',
            shouldRetry,
            invalidToken,
          };
        }
      });

      const successCount = sendResults.filter((r) => r.success).length;
      const failureCount = sendResults.filter((r) => !r.success).length;

      const sendResult: FCMSendResult = {
        success: successCount > 0,
        successCount,
        failureCount,
        results: sendResults,
      };

      this.logger.log(
        `FCM batch sent: ${successCount}/${tokens.length} successful`,
      );

      if (failureCount > 0) {
        const invalidTokens = sendResults.filter((r) => r.invalidToken).length;
        const retriableErrors = sendResults.filter((r) => r.shouldRetry).length;

        this.logger.warn(
          `FCM failures: ${failureCount} total, ${invalidTokens} invalid tokens, ${retriableErrors} retriable`,
        );
      }

      return sendResult;
    } catch (error) {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      this.logger.error('FCM send error:', errorObj.message);
      throw errorObj;
    }
  }

  async sendToTopic(
    topic: string,
    payload: FCMNotificationPayload,
    options: Partial<FCMSendOptions> = {},
  ): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('FCM service is not initialized');
    }

    const {
      priority = 'high',
      timeToLive,
      collapseKey,
      dryRun = false,
    } = options;
    const androidPriority: 'high' | 'normal' =
      priority === 'high' ? 'high' : 'normal';

    try {
      const topicMessage: TopicMessage = {
        topic,
        notification: {
          title: payload.title,
          body: payload.body,
          imageUrl: payload.imageUrl,
        },
        data: payload.data || {},
        android: {
          priority: androidPriority,
          ttl: timeToLive ? timeToLive * 1000 : undefined,
          collapseKey,
          notification: {
            title: payload.title,
            body: payload.body,
            imageUrl: payload.imageUrl,
            clickAction: payload.clickAction,
            sound: payload.sound || 'default',
          },
        },
      };

      await this.messaging.send(topicMessage, dryRun);
      this.logger.log(`FCM topic message sent to: ${topic}`);
    } catch (error) {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      this.logger.error(`FCM topic send error for ${topic}:`, errorObj.message);
      throw errorObj;
    }
  }

  async subscribeToTopic(tokens: string[], topic: string): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('FCM service is not initialized');
    }

    try {
      await this.messaging.subscribeToTopic(tokens, topic);
      this.logger.log(`Subscribed ${tokens.length} tokens to topic: ${topic}`);
    } catch (error) {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      this.logger.error(
        `FCM topic subscription error for ${topic}:`,
        errorObj.message,
      );
      throw errorObj;
    }
  }

  async unsubscribeFromTopic(tokens: string[], topic: string): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('FCM service is not initialized');
    }

    try {
      await this.messaging.unsubscribeFromTopic(tokens, topic);
      this.logger.log(
        `Unsubscribed ${tokens.length} tokens from topic: ${topic}`,
      );
    } catch (error) {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      this.logger.error(
        `FCM topic unsubscription error for ${topic}:`,
        errorObj.message,
      );
      throw errorObj;
    }
  }

  private shouldRetryError(errorCode?: string): boolean {
    const retryableErrors = [
      'messaging/internal-error',
      'messaging/server-unavailable',
      'messaging/timeout',
    ];
    return retryableErrors.includes(errorCode || '');
  }

  private isInvalidTokenError(errorCode?: string): boolean {
    const invalidTokenErrors = [
      'messaging/invalid-registration-token',
      'messaging/registration-token-not-registered',
      'messaging/invalid-argument',
    ];
    return invalidTokenErrors.includes(errorCode || '');
  }

  isAvailable(): boolean {
    return this.isInitialized;
  }

  getStatus(): { available: boolean; projectId?: string } {
    return {
      available: this.isInitialized,
      projectId: this.configService.get<string>('fcm.projectId'),
    };
  }
}
