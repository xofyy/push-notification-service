export interface RateLimitConfig {
  /**
   * Maximum number of requests allowed within the time window
   */
  limit: number;

  /**
   * Time window in seconds
   */
  windowMs: number;

  /**
   * Optional message to return when rate limit is exceeded
   */
  message?: string;

  /**
   * Optional status code to return when rate limit is exceeded (default: 429)
   */
  statusCode?: number;

  /**
   * Skip rate limiting for certain conditions
   */
  skip?: (request: any) => boolean;

  /**
   * Custom key generator for rate limiting
   */
  keyGenerator?: (request: any) => string;
}

export interface RateLimitInfo {
  /**
   * Maximum number of requests allowed
   */
  limit: number;

  /**
   * Number of requests remaining in current window
   */
  remaining: number;

  /**
   * Time when the rate limit window resets (Unix timestamp)
   */
  resetTime: number;

  /**
   * Duration of the rate limit window in seconds
   */
  windowMs: number;
}

export interface RateLimitResult {
  /**
   * Whether the request should be allowed
   */
  allowed: boolean;

  /**
   * Rate limit information
   */
  info: RateLimitInfo;

  /**
   * Error message if rate limit exceeded
   */
  message?: string;
}

export enum RateLimitType {
  GLOBAL = 'global',
  PER_PROJECT = 'per_project',
  PER_IP = 'per_ip',
  PER_ENDPOINT = 'per_endpoint',
}
