import { Injectable, Logger } from '@nestjs/common';

export enum ErrorCategory {
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  INVALID_TARGET = 'invalid_target',
  RATE_LIMIT = 'rate_limit',
  PAYLOAD_TOO_LARGE = 'payload_too_large',
  INVALID_PAYLOAD = 'invalid_payload',
  SERVICE_UNAVAILABLE = 'service_unavailable',
  QUOTA_EXCEEDED = 'quota_exceeded',
  INTERNAL_ERROR = 'internal_error',
  UNKNOWN = 'unknown',
}

export interface ClassifiedError {
  category: ErrorCategory;
  shouldRetry: boolean;
  retryAfter?: number; // seconds
  isTemporary: boolean;
  severity: 'low' | 'medium' | 'high';
  description: string;
  originalError: Error;
}

@Injectable()
export class ErrorClassifierService {
  private readonly logger = new Logger(ErrorClassifierService.name);

  classifyError(error: Error, context?: string): ClassifiedError {
    const message = error.message.toLowerCase();
    const errorCode = this.extractErrorCode(error);

    this.logger.debug(`Classifying error: ${error.message}`, {
      context,
      errorCode,
    });

    // Network-related errors
    if (this.isNetworkError(error, message)) {
      return {
        category: ErrorCategory.NETWORK,
        shouldRetry: true,
        isTemporary: true,
        severity: 'medium',
        description: 'Network connectivity issue',
        originalError: error,
      };
    }

    // Authentication errors
    if (this.isAuthenticationError(errorCode, message)) {
      return {
        category: ErrorCategory.AUTHENTICATION,
        shouldRetry: false,
        isTemporary: false,
        severity: 'high',
        description: 'Invalid credentials or authentication failed',
        originalError: error,
      };
    }

    // Invalid target (token/subscription) errors
    if (this.isInvalidTargetError(errorCode, message)) {
      return {
        category: ErrorCategory.INVALID_TARGET,
        shouldRetry: false,
        isTemporary: false,
        severity: 'low',
        description: 'Invalid device token or subscription',
        originalError: error,
      };
    }

    // Rate limiting errors
    const rateLimitResult = this.isRateLimitError(errorCode, message, error);
    if (rateLimitResult) {
      return {
        category: ErrorCategory.RATE_LIMIT,
        shouldRetry: true,
        retryAfter: rateLimitResult.retryAfter,
        isTemporary: true,
        severity: 'medium',
        description: 'Rate limit exceeded',
        originalError: error,
      };
    }

    // Payload errors
    if (this.isPayloadError(errorCode, message)) {
      return {
        category: ErrorCategory.PAYLOAD_TOO_LARGE,
        shouldRetry: false,
        isTemporary: false,
        severity: 'low',
        description: 'Notification payload too large',
        originalError: error,
      };
    }

    if (this.isInvalidPayloadError(errorCode, message)) {
      return {
        category: ErrorCategory.INVALID_PAYLOAD,
        shouldRetry: false,
        isTemporary: false,
        severity: 'medium',
        description: 'Invalid notification payload format',
        originalError: error,
      };
    }

    // Service availability errors
    if (this.isServiceUnavailableError(errorCode, message)) {
      return {
        category: ErrorCategory.SERVICE_UNAVAILABLE,
        shouldRetry: true,
        isTemporary: true,
        severity: 'high',
        description: 'Push service temporarily unavailable',
        originalError: error,
      };
    }

    // Quota errors
    if (this.isQuotaExceededError(errorCode, message)) {
      return {
        category: ErrorCategory.QUOTA_EXCEEDED,
        shouldRetry: false,
        isTemporary: false,
        severity: 'high',
        description: 'API quota or limit exceeded',
        originalError: error,
      };
    }

    // Internal/server errors
    if (this.isInternalError(errorCode, message)) {
      return {
        category: ErrorCategory.INTERNAL_ERROR,
        shouldRetry: true,
        isTemporary: true,
        severity: 'high',
        description: 'Internal server error',
        originalError: error,
      };
    }

    // Unknown errors
    return {
      category: ErrorCategory.UNKNOWN,
      shouldRetry: true,
      isTemporary: true,
      severity: 'medium',
      description: 'Unknown error occurred',
      originalError: error,
    };
  }

  private extractErrorCode(error: Error): string | null {
    // Extract error codes from different error types
    const errorAny = error as any;

    // FCM errors
    if (errorAny.errorInfo?.code) {
      return errorAny.errorInfo.code;
    }

    // APNs errors
    if (errorAny.status) {
      return errorAny.status.toString();
    }

    // Web Push errors
    if (errorAny.statusCode) {
      return errorAny.statusCode.toString();
    }

    // HTTP errors
    if (errorAny.code) {
      return errorAny.code;
    }

    return null;
  }

  private isNetworkError(error: Error, message: string): boolean {
    const networkKeywords = [
      'network',
      'timeout',
      'connection',
      'refused',
      'unreachable',
      'dns',
      'enotfound',
      'econnreset',
      'etimedout',
    ];

    return networkKeywords.some((keyword) => message.includes(keyword));
  }

  private isAuthenticationError(
    errorCode: string | null,
    message: string,
  ): boolean {
    const authErrorCodes = [
      '401',
      '403',
      'authentication-error',
      'invalid-credential',
      'unauthorized',
    ];

    const authKeywords = [
      'authentication',
      'unauthorized',
      'invalid credential',
      'invalid key',
      'forbidden',
    ];

    return (
      (errorCode && authErrorCodes.some((code) => errorCode.includes(code))) ||
      authKeywords.some((keyword) => message.includes(keyword))
    );
  }

  private isInvalidTargetError(
    errorCode: string | null,
    message: string,
  ): boolean {
    const invalidTargetCodes = [
      'registration-token-not-registered',
      'invalid-registration-token',
      'invalid-argument',
      '410', // APNs gone
    ];

    const invalidTargetKeywords = [
      'invalid token',
      'invalid subscription',
      'unregistered',
      'not registered',
      'gone',
    ];

    return (
      (errorCode &&
        invalidTargetCodes.some((code) => errorCode.includes(code))) ||
      invalidTargetKeywords.some((keyword) => message.includes(keyword))
    );
  }

  private isRateLimitError(
    errorCode: string | null,
    message: string,
    error: Error,
  ): { retryAfter?: number } | null {
    const rateLimitCodes = ['429', 'quota-exceeded', 'rate-limited'];
    const rateLimitKeywords = [
      'rate limit',
      'too many requests',
      'quota exceeded',
    ];

    const isRateLimit =
      (errorCode && rateLimitCodes.some((code) => errorCode.includes(code))) ||
      rateLimitKeywords.some((keyword) => message.includes(keyword));

    if (!isRateLimit) {
      return null;
    }

    // Try to extract retry-after header
    const errorAny = error as any;
    let retryAfter: number | undefined;

    if (errorAny.headers && errorAny.headers['retry-after']) {
      retryAfter = parseInt(errorAny.headers['retry-after'], 10);
    }

    return { retryAfter };
  }

  private isPayloadError(errorCode: string | null, message: string): boolean {
    const payloadCodes = ['413', 'payload-too-large'];
    const payloadKeywords = [
      'payload too large',
      'message too large',
      'size limit',
    ];

    return (
      (errorCode && payloadCodes.some((code) => errorCode.includes(code))) ||
      payloadKeywords.some((keyword) => message.includes(keyword))
    );
  }

  private isInvalidPayloadError(
    errorCode: string | null,
    message: string,
  ): boolean {
    const invalidPayloadCodes = ['400', 'invalid-argument'];
    const invalidPayloadKeywords = [
      'invalid payload',
      'malformed',
      'bad request',
      'invalid format',
    ];

    return (
      (errorCode &&
        invalidPayloadCodes.some((code) => errorCode.includes(code))) ||
      invalidPayloadKeywords.some((keyword) => message.includes(keyword))
    );
  }

  private isServiceUnavailableError(
    errorCode: string | null,
    message: string,
  ): boolean {
    const unavailableCodes = ['500', '502', '503', '504', 'unavailable'];
    const unavailableKeywords = [
      'service unavailable',
      'temporarily unavailable',
      'internal server error',
      'bad gateway',
      'gateway timeout',
    ];

    return (
      (errorCode &&
        unavailableCodes.some((code) => errorCode.includes(code))) ||
      unavailableKeywords.some((keyword) => message.includes(keyword))
    );
  }

  private isQuotaExceededError(
    errorCode: string | null,
    message: string,
  ): boolean {
    const quotaCodes = ['quota-exceeded', 'sender-id-mismatch'];
    const quotaKeywords = ['quota exceeded', 'limit exceeded', 'usage limit'];

    return (
      (errorCode && quotaCodes.some((code) => errorCode.includes(code))) ||
      quotaKeywords.some((keyword) => message.includes(keyword))
    );
  }

  private isInternalError(errorCode: string | null, message: string): boolean {
    const internalCodes = ['500', 'internal-error'];
    const internalKeywords = ['internal error', 'unexpected error'];

    return (
      (errorCode && internalCodes.some((code) => errorCode.includes(code))) ||
      internalKeywords.some((keyword) => message.includes(keyword))
    );
  }
}
