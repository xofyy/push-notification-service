import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Response } from 'express';
import { RateLimitService } from '../services/rate-limit.service';
import { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';
import {
  RateLimitConfig,
  RateLimitType,
} from '../interfaces/rate-limit.interface';

// Decorator metadata keys
export const RATE_LIMIT_KEY = 'rate_limit';

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly logger = new Logger(RateLimitGuard.name);

  // Default rate limit configurations
  private readonly defaultConfigs: Record<string, RateLimitConfig> = {
    // High-frequency endpoints (notifications, analytics)
    high: {
      limit: 100,
      windowMs: 60, // 1 minute
      message: 'Too many requests. Please try again later.',
    },
    // Medium-frequency endpoints (device management)
    medium: {
      limit: 300,
      windowMs: 60, // 1 minute
      message: 'Rate limit exceeded. Please slow down your requests.',
    },
    // Low-frequency endpoints (admin operations)
    low: {
      limit: 1000,
      windowMs: 3600, // 1 hour
      message: 'Hourly rate limit exceeded.',
    },
    // Global fallback
    default: {
      limit: 1000,
      windowMs: 3600, // 1 hour
      message: 'Rate limit exceeded.',
    },
  };

  constructor(
    private readonly rateLimitService: RateLimitService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const response = context.switchToHttp().getResponse<Response>();

    // Get rate limit configuration from decorator or use default
    const rateLimitConfig = this.getRateLimitConfig(context);

    if (!rateLimitConfig) {
      return true; // No rate limiting configured
    }

    // Generate rate limit key
    const key = this.generateRateLimitKey(request, rateLimitConfig);

    try {
      // Check rate limit
      const result = await this.rateLimitService.checkRateLimit(
        key,
        rateLimitConfig,
      );

      // Add rate limit headers to response
      this.addRateLimitHeaders(response, result.info);

      if (!result.allowed) {
        this.logger.warn(`Rate limit exceeded for key: ${key}`);
        throw new HttpException(
          {
            statusCode:
              rateLimitConfig.statusCode || HttpStatus.TOO_MANY_REQUESTS,
            message: result.message,
            error: 'Too Many Requests',
            retryAfter: Math.ceil((result.info.resetTime - Date.now()) / 1000),
          },
          rateLimitConfig.statusCode || HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      return true;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(`Rate limiting error for key ${key}:`, error);
      // On error, allow the request but log the issue
      return true;
    }
  }

  /**
   * Get rate limit configuration from decorator metadata
   */
  private getRateLimitConfig(
    context: ExecutionContext,
  ): RateLimitConfig | null {
    // Check method-level decorator first
    const methodConfig = this.reflector.get<RateLimitConfig>(
      RATE_LIMIT_KEY,
      context.getHandler(),
    );

    if (methodConfig) {
      return methodConfig;
    }

    // Check class-level decorator
    const classConfig = this.reflector.get<RateLimitConfig>(
      RATE_LIMIT_KEY,
      context.getClass(),
    );

    if (classConfig) {
      return classConfig;
    }

    // Determine default config based on endpoint
    const request = context.switchToHttp().getRequest();
    const endpoint = `${request.method} ${request.route?.path || request.url}`;

    return this.getDefaultConfigForEndpoint(endpoint);
  }

  /**
   * Get default rate limit configuration based on endpoint pattern
   */
  private getDefaultConfigForEndpoint(
    endpoint: string,
  ): RateLimitConfig | null {
    // High-frequency endpoints
    if (
      endpoint.includes('/notifications/send') ||
      endpoint.includes('/analytics/events') ||
      endpoint.includes('/devices/register')
    ) {
      return this.defaultConfigs.high;
    }

    // Medium-frequency endpoints
    if (
      endpoint.includes('/devices') ||
      endpoint.includes('/templates') ||
      endpoint.includes('/queues/jobs')
    ) {
      return this.defaultConfigs.medium;
    }

    // Low-frequency endpoints (admin, stats, exports)
    if (
      endpoint.includes('/stats') ||
      endpoint.includes('/export') ||
      endpoint.includes('/admin') ||
      endpoint.includes('/health')
    ) {
      return this.defaultConfigs.low;
    }

    // Apply default rate limiting to all authenticated endpoints
    return this.defaultConfigs.default;
  }

  /**
   * Generate rate limit key based on request context
   */
  private generateRateLimitKey(
    request: AuthenticatedRequest,
    config: RateLimitConfig,
  ): string {
    // Use custom key generator if provided
    if (config.keyGenerator) {
      return config.keyGenerator(request);
    }

    // Default key generation strategy
    const identifiers: Record<string, string> = {};

    // Add project ID if available (most specific)
    if (request.project?._id) {
      identifiers.project = request.project._id.toString();
    }

    // Add IP address as fallback
    const clientIp = this.getClientIp(request);
    if (clientIp) {
      identifiers.ip = clientIp;
    }

    // Add endpoint for per-endpoint limiting
    const endpoint = `${request.method}:${request.route?.path || request.url}`;
    identifiers.endpoint = endpoint.replace(/[^a-zA-Z0-9:/_-]/g, '_');

    // Generate key based on available identifiers
    if (identifiers.project) {
      return this.rateLimitService.generateKey(
        RateLimitType.PER_PROJECT,
        identifiers,
      );
    } else if (identifiers.ip) {
      return this.rateLimitService.generateKey(
        RateLimitType.PER_IP,
        identifiers,
      );
    } else {
      return this.rateLimitService.generateKey(
        RateLimitType.GLOBAL,
        identifiers,
      );
    }
  }

  /**
   * Extract client IP address from request
   */
  private getClientIp(request: any): string {
    return (
      request.headers['x-forwarded-for']?.split(',')[0] ||
      request.headers['x-real-ip'] ||
      request.connection?.remoteAddress ||
      request.socket?.remoteAddress ||
      request.ip ||
      'unknown'
    );
  }

  /**
   * Add rate limit headers to response
   */
  private addRateLimitHeaders(response: Response, info: any): void {
    response.setHeader('X-RateLimit-Limit', info.limit.toString());
    response.setHeader('X-RateLimit-Remaining', info.remaining.toString());
    response.setHeader(
      'X-RateLimit-Reset',
      Math.ceil(info.resetTime / 1000).toString(),
    );
    response.setHeader('X-RateLimit-Window', info.windowMs.toString());
  }
}
