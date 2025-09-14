# Rate Limiting System Documentation

## Overview

The Rate Limiting System provides enterprise-grade API protection using Redis-based storage to prevent abuse and ensure fair usage across all endpoints.

## Features

- **Redis-based Storage**: Uses existing Upstash Redis for persistent rate limit counters
- **Project-scoped Limits**: Different rate limits per authenticated project
- **Configurable Tiers**: Multiple rate limit levels for different endpoint types
- **Rate Limit Headers**: Standard HTTP headers in responses
- **Admin Monitoring**: Built-in endpoints for monitoring and management
- **Graceful Degradation**: System continues working even if Redis is unavailable

## Rate Limit Tiers

### High Frequency (100 requests/minute)
- **Use Case**: Critical real-time operations
- **Endpoints**: 
  - `POST /notifications/send` - Notification sending
  - `POST /analytics/events` - Event tracking
  - `POST /analytics/events/batch` - Batch event tracking
  - `POST /devices/register` - Device registration
  - `POST /templates/render` - Template rendering

### Medium Frequency (300 requests/minute)
- **Use Case**: Regular application operations
- **Endpoints**:
  - `GET /notifications` - List notifications
  - `GET /templates` - List templates
  - `POST /queues/jobs` - Queue job creation
  - Most device management endpoints

### Low Frequency (1000 requests/hour)
- **Use Case**: Administrative and reporting operations
- **Endpoints**:
  - `GET /analytics/export` - Data exports
  - `GET /queues/stats` - Queue statistics
  - Admin endpoints

### Strict Limits (10 requests/minute)
- **Use Case**: Security-sensitive operations
- **Endpoints**:
  - `POST /devices/validate-token` - Token validation
  - `POST /devices/validate-tokens-batch` - Batch validation

## Implementation

### Basic Usage

```typescript
import { HighFrequencyRateLimit } from '../../common/decorators/rate-limit.decorator';

@Controller('notifications')
export class NotificationsController {
  @Post('send')
  @HighFrequencyRateLimit() // 100 requests per minute
  sendNotification() {
    // Implementation
  }
}
```

### Custom Rate Limits

```typescript
import { RateLimit } from '../../common/decorators/rate-limit.decorator';

@Post('custom-endpoint')
@RateLimit({
  limit: 50,
  windowMs: 30, // 30 seconds
  message: 'Custom rate limit exceeded',
})
customEndpoint() {
  // Implementation
}
```

### Project-specific Rate Limits

```typescript
import { ProjectRateLimit } from '../../common/decorators/rate-limit.decorator';

@Post('premium-feature')
@ProjectRateLimit(1000, 3600) // 1000 requests per hour per project
premiumFeature() {
  // Implementation
}
```

## Rate Limit Headers

All rate-limited responses include these headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1703772600
X-RateLimit-Window: 60
```

## Error Response

When rate limit is exceeded:

```json
{
  "statusCode": 429,
  "message": "Too many requests. Limit: 100 requests per minute.",
  "error": "Too Many Requests",
  "retryAfter": 45
}
```

## Admin Endpoints

### Check Rate Limit Status
```
GET /admin/rate-limits/status
```

Response:
```json
{
  "projectId": "64f...",
  "projectName": "My Project",
  "rateLimits": [
    {
      "key": "rate_limit:per_project:project:64f...:endpoint:POST_notifications_send:1703772600",
      "count": 45,
      "ttl": 30
    }
  ],
  "summary": {
    "totalEndpoints": 5,
    "activeEndpoints": 2
  }
}
```

### Reset Rate Limits
```
DELETE /admin/rate-limits/reset
```

### Health Check
```
GET /admin/rate-limits/health
```

## Configuration

Rate limits are configured in the guard with these defaults:

```typescript
const defaultConfigs = {
  high: {
    limit: 100,
    windowMs: 60, // 1 minute
  },
  medium: {
    limit: 300,
    windowMs: 60, // 1 minute
  },
  low: {
    limit: 1000,
    windowMs: 3600, // 1 hour
  },
  strict: {
    limit: 10,
    windowMs: 60, // 1 minute
  }
};
```

## Redis Key Structure

Rate limit keys follow this pattern:
```
rate_limit:{type}:project:{projectId}:endpoint:{method}_{path}:{window}
```

Examples:
```
rate_limit:per_project:project:64f123:endpoint:POST_notifications_send:1703772600
rate_limit:per_ip:ip:192.168.1.1:endpoint:GET_devices:1703772600
```

## Monitoring and Alerting

### Key Metrics to Monitor

1. **Rate Limit Violations**: Track 429 responses
2. **Redis Connectivity**: Monitor Redis health
3. **Per-project Usage**: Identify heavy users
4. **Endpoint Performance**: Track which endpoints hit limits most

### Recommended Alerts

1. **High Rate Limit Violations**: > 100 429s per minute
2. **Redis Connection Issues**: Failed rate limit checks
3. **Project Quota Exhaustion**: Project hitting limits frequently

## Best Practices

### For API Clients

1. **Respect Rate Limit Headers**: Check remaining quota
2. **Implement Exponential Backoff**: When hitting limits
3. **Batch Operations**: Use batch endpoints when available
4. **Cache Responses**: Reduce redundant API calls

### For Administrators

1. **Monitor Usage Patterns**: Identify optimization opportunities
2. **Adjust Limits**: Based on usage analytics
3. **Premium Tiers**: Consider higher limits for paying customers
4. **Performance Testing**: Ensure limits don't impact legitimate usage

## Troubleshooting

### Common Issues

1. **Redis Connection Errors**
   - Check Redis URL configuration
   - Verify Upstash Redis service status
   - Check network connectivity

2. **Rate Limits Too Aggressive**
   - Review usage patterns
   - Adjust limits in guard configuration
   - Consider per-project custom limits

3. **Performance Impact**
   - Monitor Redis latency
   - Consider Redis cluster for high load
   - Implement caching for rate limit checks

### Debug Commands

Check rate limit status:
```bash
curl -H "X-API-Key: your-key" \
  http://localhost:3000/admin/rate-limits/status
```

Reset rate limits:
```bash
curl -X DELETE -H "X-API-Key: your-key" \
  http://localhost:3000/admin/rate-limits/reset
```

## Security Considerations

1. **API Key Protection**: Rate limits are per authenticated project
2. **IP-based Fallback**: For unauthenticated requests
3. **Admin Access**: Only project owners can manage their rate limits
4. **Redis Security**: Use secured Redis connection in production

## Performance Impact

- **Latency**: ~1-2ms additional latency per request
- **Memory**: Minimal impact with Redis storage
- **CPU**: Low overhead for rate limit calculations
- **Network**: Small additional Redis round-trip

## Future Enhancements

1. **Dynamic Rate Limits**: Based on project tier
2. **Burst Allowances**: Temporary higher limits
3. **Geographic Limits**: Different limits per region
4. **Machine Learning**: Adaptive rate limiting based on patterns