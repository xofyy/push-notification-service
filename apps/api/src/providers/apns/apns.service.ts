import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as apn from 'apn';

export interface APNsNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, unknown>;
  badge?: number;
  sound?: string;
  category?: string;
  contentAvailable?: boolean;
  mutableContent?: boolean;
  threadId?: string;
  targetContentId?: string;
}

export interface APNsSendOptions {
  tokens: string[];
  payload: APNsNotificationPayload;
  topic?: string;
  priority?: number;
  expiry?: Date;
  collapseId?: string;
  pushType?:
    | 'alert'
    | 'background'
    | 'voip'
    | 'complication'
    | 'fileprovider'
    | 'mdm';
}

export interface APNsSendResult {
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
export class APNsService implements OnModuleInit {
  private readonly logger = new Logger(APNsService.name);
  private provider: apn.Provider;
  private isInitialized = false;
  private defaultTopic: string;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    await this.initializeAPNs();
  }

  private async initializeAPNs(): Promise<void> {
    try {
      const keyId = this.configService.get<string>('pushProviders.apns.keyId');
      const teamId = this.configService.get<string>(
        'pushProviders.apns.teamId',
      );
      const bundleId = this.configService.get<string>(
        'pushProviders.apns.bundleId',
      );
      const privateKey = this.configService.get<string>(
        'pushProviders.apns.privateKey',
      );
      const production = this.configService.get<boolean>(
        'pushProviders.apns.production',
      );

      if (!keyId || !teamId || !bundleId || !privateKey) {
        this.logger.warn(
          'APNs configuration not complete. APNs will not be available.',
        );
        return;
      }

      const options: apn.ProviderOptions = {
        token: {
          key: privateKey,
          keyId: keyId,
          teamId: teamId,
        },
        production: production || false,
      };

      this.provider = new apn.Provider(options);
      this.defaultTopic = bundleId;
      this.isInitialized = true;

      this.logger.log(
        `✅ APNs service initialized successfully (${production ? 'Production' : 'Sandbox'})`,
      );
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      this.logger.error('❌ Failed to initialize APNs service:', errorObj.message);
      this.isInitialized = false;
    }
  }

  async sendToSingleDevice(
    token: string,
    payload: APNsNotificationPayload,
    options: Partial<APNsSendOptions> = {},
  ): Promise<APNsSendResult> {
    return this.sendToMultipleDevices({ ...options, tokens: [token], payload });
  }

  async sendToMultipleDevices(
    options: APNsSendOptions,
  ): Promise<APNsSendResult> {
    if (!this.isInitialized) {
      throw new Error('APNs service is not initialized');
    }

    const {
      tokens,
      payload,
      topic,
      priority = 10,
      expiry,
      collapseId,
      pushType = 'alert',
    } = options;

    if (!tokens || tokens.length === 0) {
      throw new Error('At least one token is required');
    }

    try {
      const notification = new apn.Notification();

      // Set notification content
      notification.alert = {
        title: payload.title,
        body: payload.body,
      };

      if (payload.badge !== undefined) {
        notification.badge = payload.badge;
      }

      if (payload.sound) {
        notification.sound = payload.sound;
      } else {
        notification.sound = 'default';
      }

      if (payload.category) {
        (notification as apn.Notification & { category?: string }).category = payload.category;
      }

      if (payload.contentAvailable) {
        notification.contentAvailable = payload.contentAvailable;
      }

      if (payload.mutableContent) {
        notification.mutableContent = payload.mutableContent;
      }

      if (payload.threadId) {
        notification.threadId = payload.threadId;
      }

      if (payload.targetContentId) {
        (notification as apn.Notification & { targetContentId?: string }).targetContentId = payload.targetContentId;
      }

      // Set topic (bundle ID)
      notification.topic = topic || this.defaultTopic;

      // Set priority
      notification.priority = priority;

      // Set expiry
      if (expiry) {
        notification.expiry = Math.floor(expiry.getTime() / 1000);
      }

      // Set collapse ID
      if (collapseId) {
        notification.collapseId = collapseId;
      }

      // Set push type
      (notification as apn.Notification & { pushType?: string }).pushType = pushType;

      // Add custom data
      if (payload.data) {
        notification.payload = { ...payload.data };
      }

      // Send to all tokens
      const results = await Promise.allSettled(
        tokens.map(async (token) => {
          try {
            const result = await this.provider.send(notification, token);
            return { token, result };
          } catch (error) {
            return { token, error };
          }
        }),
      );

      const sendResults = results.map((resultItem, index) => {
        const token = tokens[index];

        if (resultItem.status === 'fulfilled') {
          const result = resultItem.value;
          
          if ('result' in result && result.result) {
            const apnResult = result.result as { sent?: unknown[]; failed?: Array<{ status?: string; response?: { reason?: string } }> };

            if (apnResult.sent && apnResult.sent.length > 0) {
              return {
                token,
                success: true,
                messageId: `apns-${Date.now()}-${token.slice(-8)}`,
              };
            } else if (apnResult.failed && apnResult.failed.length > 0) {
              const failure = apnResult.failed[0];
              const shouldRetry = this.shouldRetryError(failure.status);
              const invalidToken = this.isInvalidTokenError(failure.status);

              return {
                token,
                success: false,
                error: `${failure.status}: ${failure.response?.reason || 'Unknown error'}`,
                shouldRetry,
                invalidToken,
              };
            }
          }
        }

        // Handle Promise rejection or unknown error
        const errorReason = resultItem.status === 'rejected' ? resultItem.reason : 
                           (resultItem.status === 'fulfilled' && 'error' in resultItem.value ? resultItem.value.error : null);
        const errorMessage = errorReason instanceof Error ? errorReason.message : 'Unknown error';
        
        return {
          token,
          success: false,
          error: errorMessage,
          shouldRetry: false,
          invalidToken: false,
        };
      });

      const successCount = sendResults.filter((r) => r.success).length;
      const failureCount = sendResults.filter((r) => !r.success).length;

      const sendResult: APNsSendResult = {
        success: successCount > 0,
        successCount,
        failureCount,
        results: sendResults,
      };

      this.logger.log(
        `APNs batch sent: ${successCount}/${tokens.length} successful`,
      );

      if (failureCount > 0) {
        const invalidTokens = sendResults.filter((r) => r.invalidToken).length;
        const retriableErrors = sendResults.filter((r) => r.shouldRetry).length;

        this.logger.warn(
          `APNs failures: ${failureCount} total, ${invalidTokens} invalid tokens, ${retriableErrors} retriable`,
        );
      }

      return sendResult;
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      this.logger.error('APNs send error:', errorObj.message);
      throw errorObj;
    }
  }

  private shouldRetryError(status?: string): boolean {
    const retryableStatuses = [
      '429', // TooManyRequests
      '500', // InternalServerError
      '502', // BadGateway
      '503', // ServiceUnavailable
    ];
    return retryableStatuses.includes(status || '');
  }

  private isInvalidTokenError(status?: string): boolean {
    const invalidTokenStatuses = [
      '400', // BadDeviceToken
      '410', // Unregistered
    ];
    return invalidTokenStatuses.includes(status || '');
  }

  isAvailable(): boolean {
    return this.isInitialized;
  }

  getStatus(): { available: boolean; production?: boolean; topic?: string } {
    return {
      available: this.isInitialized,
      production: this.configService.get<boolean>(
        'pushProviders.apns.production',
      ),
      topic: this.defaultTopic,
    };
  }

  async shutdown(): Promise<void> {
    if (this.provider) {
      this.provider.shutdown();
      this.logger.log('APNs provider shutdown');
    }
  }
}
