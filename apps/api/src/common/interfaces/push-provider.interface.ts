import { ErrorCategory } from '../error-handling';

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

export interface PushProvider {
    send(
        payload: UnifiedNotificationPayload,
        targets: NotificationTarget[],
        dryRun?: boolean,
    ): Promise<UnifiedSendResult['results']>;

    getStatus(): { available: boolean;[key: string]: any };

    isAvailable(): boolean;
}
