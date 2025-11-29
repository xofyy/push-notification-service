export interface RateLimitInfo {
    limit: number;
    remaining: number;
    resetTime: number;
    windowMs: number;
}
