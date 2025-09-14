import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common';
import { RateLimitGuard, RATE_LIMIT_KEY } from '../guards/rate-limit.guard';
import { RateLimitConfig } from '../interfaces/rate-limit.interface';

/**
 * Apply rate limiting to a controller or method
 * @param config - Rate limit configuration
 * @returns Decorator function
 */
export const RateLimit = (config: RateLimitConfig) =>
  applyDecorators(
    SetMetadata(RATE_LIMIT_KEY, config),
    UseGuards(RateLimitGuard),
  );

/**
 * Apply high-frequency rate limiting (100 requests per minute)
 * Suitable for notification sending, event tracking
 */
export const HighFrequencyRateLimit = () =>
  RateLimit({
    limit: 100,
    windowMs: 60, // 1 minute
    message: 'Too many requests. Limit: 100 requests per minute.',
  });

/**
 * Apply medium-frequency rate limiting (300 requests per minute)
 * Suitable for device management, template operations
 */
export const MediumFrequencyRateLimit = () =>
  RateLimit({
    limit: 300,
    windowMs: 60, // 1 minute
    message: 'Rate limit exceeded. Limit: 300 requests per minute.',
  });

/**
 * Apply low-frequency rate limiting (1000 requests per hour)
 * Suitable for admin operations, statistics, exports
 */
export const LowFrequencyRateLimit = () =>
  RateLimit({
    limit: 1000,
    windowMs: 3600, // 1 hour
    message: 'Hourly rate limit exceeded. Limit: 1000 requests per hour.',
  });

/**
 * Apply strict rate limiting (10 requests per minute)
 * Suitable for sensitive operations like token validation
 */
export const StrictRateLimit = () =>
  RateLimit({
    limit: 10,
    windowMs: 60, // 1 minute
    message: 'Strict rate limit exceeded. Limit: 10 requests per minute.',
  });

/**
 * Apply burst rate limiting (50 requests per 10 seconds)
 * Suitable for preventing rapid successive calls
 */
export const BurstRateLimit = () =>
  RateLimit({
    limit: 50,
    windowMs: 10, // 10 seconds
    message: 'Burst rate limit exceeded. Limit: 50 requests per 10 seconds.',
  });

/**
 * Apply custom rate limiting with per-project key generation
 * @param limit - Maximum requests allowed
 * @param windowMs - Time window in seconds
 * @param message - Custom error message
 */
export const ProjectRateLimit = (
  limit: number,
  windowMs: number,
  message?: string,
) =>
  RateLimit({
    limit,
    windowMs,
    message:
      message ||
      `Rate limit exceeded. Limit: ${limit} requests per ${windowMs}s.`,
    keyGenerator: (request) => {
      const projectId = request.project?._id?.toString() || 'anonymous';
      const endpoint = `${request.method}:${request.route?.path || request.url}`;
      return `project:${projectId}:endpoint:${endpoint.replace(/[^a-zA-Z0-9:/_-]/g, '_')}`;
    },
  });

/**
 * Apply per-IP rate limiting regardless of project
 * @param limit - Maximum requests allowed
 * @param windowMs - Time window in seconds
 */
export const IpRateLimit = (limit: number, windowMs: number) =>
  RateLimit({
    limit,
    windowMs,
    message: `IP rate limit exceeded. Limit: ${limit} requests per ${windowMs}s.`,
    keyGenerator: (request) => {
      const clientIp =
        request.headers['x-forwarded-for']?.split(',')[0] ||
        request.headers['x-real-ip'] ||
        request.connection?.remoteAddress ||
        request.socket?.remoteAddress ||
        request.ip ||
        'unknown';
      return `ip:${clientIp}`;
    },
  });

/**
 * Skip rate limiting for certain requests
 * @param skipCondition - Function that returns true to skip rate limiting
 */
export const ConditionalRateLimit = (
  config: Omit<RateLimitConfig, 'skip'>,
  skipCondition: (request: any) => boolean,
) =>
  RateLimit({
    ...config,
    skip: skipCondition,
  });
