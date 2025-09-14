# Swagger/OpenAPI Documentation Guide

## Overview

The Push Notification Service API is fully documented using Swagger/OpenAPI 3.0 specification, providing interactive documentation, code examples, and testing capabilities.

## Access Documentation

### Development Environment
- **Interactive UI**: http://localhost:3000/api/docs
- **OpenAPI Spec**: `docs/openapi.json` (auto-generated)
- **Health Check**: http://localhost:3000/api/v1/health

### Production Environment
- **Interactive UI**: https://api.yourcompany.com/api/docs
- **Health Check**: https://api.yourcompany.com/api/v1/health

## Documentation Features

### ✅ **Complete API Coverage**
- **Projects**: Project management and configuration
- **Devices**: Device registration, validation, and management
- **Notifications**: Send and manage push notifications
- **Templates**: Notification templates with variable substitution
- **Analytics**: Analytics, tracking, and reporting
- **Queues**: Job queue management and monitoring
- **Rate Limit Admin**: Rate limiting administration
- **Health**: System health and status endpoints

### ✅ **Authentication Documentation**
- API Key authentication with `X-API-Key` header
- Project-scoped access control
- Security scheme definitions
- Authentication examples

### ✅ **Rate Limiting Information**
- Rate limit tiers and restrictions
- Response header documentation
- Error response examples
- Usage guidelines

### ✅ **Comprehensive Examples**
- Request/response examples for all endpoints
- Real-world use cases
- Error scenarios
- SDK code samples

### ✅ **Interactive Testing**
- Try It Out functionality
- Request/response validation
- Authentication persistence
- Real-time API testing

## Swagger Configuration

### Main Configuration (main.ts)

```typescript
const config = new DocumentBuilder()
  .setTitle('Push Notification Service API')
  .setDescription('Enterprise-grade Push Notification Service...')
  .setVersion('1.0.0')
  .addApiKey({
    type: 'apiKey',
    name: 'X-API-Key',
    in: 'header',
  }, 'ApiKeyAuth')
  .addTag('Projects', 'Project management and configuration')
  .addTag('Devices', 'Device registration, validation, and management')
  // ... more tags
  .build();
```

### Controller Documentation

Each controller includes comprehensive Swagger decorators:

```typescript
@ApiTags('Notifications')
@ApiSecurity('ApiKeyAuth')
@ApiHeader({
  name: 'X-API-Key',
  description: 'API Key for authentication',
  required: true,
})
export class NotificationsController {
  @Post('send')
  @ApiOperation({
    summary: 'Send push notification',
    description: 'Detailed description...',
  })
  @ApiResponse({
    status: 201,
    description: 'Notification sent successfully',
    schema: { example: { /* response example */ } },
  })
  @ApiResponse({
    status: 429,
    description: 'Rate limit exceeded',
    headers: {
      'X-RateLimit-Limit': { description: 'Request limit' },
      // ... more headers
    },
  })
  sendNotification() {
    // Implementation
  }
}
```

### DTO Documentation

DTOs include detailed property documentation:

```typescript
export class SendNotificationDto {
  @ApiProperty({
    description: 'Notification title',
    example: 'Welcome to our app!',
    minLength: 1,
    maxLength: 100,
  })
  title: string;

  @ApiPropertyOptional({
    description: 'Custom data payload',
    example: {
      userId: '12345',
      campaignId: 'welcome_series_1',
    },
  })
  data?: Record<string, any>;
}
```

## API Structure

### Base URL
- Development: `http://localhost:3000/api/v1`
- Production: `https://api.yourcompany.com/api/v1`

### Authentication
All endpoints require the `X-API-Key` header:
```
X-API-Key: your-project-api-key-here
```

### Rate Limiting
API endpoints are rate-limited with these tiers:

| Tier | Limit | Endpoints |
|------|-------|-----------|
| High Frequency | 100/min | Notifications, Events, Device Registration |
| Medium Frequency | 300/min | Device Management, Templates |
| Low Frequency | 1000/hour | Analytics, Admin, Exports |
| Strict | 10/min | Token Validation |

### Response Headers
Rate-limited responses include:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1701964800
X-RateLimit-Window: 60
```

## Error Handling

### Standard Error Response
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

### Rate Limit Error
```json
{
  "statusCode": 429,
  "message": "Too many requests. Limit: 100 requests per minute.",
  "error": "Too Many Requests",
  "retryAfter": 45
}
```

### Authentication Error
```json
{
  "statusCode": 401,
  "message": "API key is required. Please provide X-API-Key header.",
  "error": "Unauthorized"
}
```

## Usage Examples

### Basic Notification
```bash
curl -X POST https://api.yourcompany.com/api/v1/projects/64f.../notifications/send \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "title": "Hello!",
    "body": "This is a test notification",
    "targetTags": ["test-users"]
  }'
```

### Device Registration
```bash
curl -X POST https://api.yourcompany.com/api/v1/projects/64f.../devices/register \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "token": "fcm_device_token_here",
    "platform": "android",
    "userId": "user123"
  }'
```

## Advanced Features

### Template-based Notifications
```json
{
  "templateId": "64f1a2b3c4d5e6f7a8b9c0d4",
  "templateVariables": {
    "userName": "John Doe",
    "productName": "Premium Plan"
  },
  "targetTags": ["premium-users"]
}
```

### Scheduled Notifications
```json
{
  "title": "Daily Reminder",
  "body": "Don't forget your daily tasks!",
  "scheduledFor": "2023-12-08T09:00:00.000Z",
  "targetTags": ["daily-reminders"]
}
```

### Recurring Notifications
```json
{
  "title": "Weekly Newsletter",
  "body": "Your weekly digest is ready!",
  "recurring": {
    "pattern": "0 9 * * MON",
    "timezone": "America/New_York"
  }
}
```

## SDK Integration

### JavaScript/TypeScript
```typescript
import { PushNotificationClient } from '@yourcompany/push-sdk';

const client = new PushNotificationClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.yourcompany.com/api/v1'
});

await client.notifications.send({
  title: 'Hello!',
  body: 'Test notification',
  targetTags: ['users']
});
```

### OpenAPI Code Generation
Generate client SDKs using the OpenAPI specification:

```bash
# Generate TypeScript client
npx @openapitools/openapi-generator-cli generate \
  -i docs/openapi.json \
  -g typescript-axios \
  -o clients/typescript

# Generate Python client
npx @openapitools/openapi-generator-cli generate \
  -i docs/openapi.json \
  -g python \
  -o clients/python
```

## Testing with Swagger UI

### Interactive Testing
1. Visit http://localhost:3000/api/docs
2. Click "Authorize" and enter your API key
3. Expand any endpoint section
4. Click "Try it out"
5. Fill in parameters and request body
6. Execute the request
7. View the response

### Authentication Setup
1. Click the "Authorize" button (🔒) at the top
2. Enter your API key in the "ApiKeyAuth" field
3. Click "Authorize"
4. The key will be persisted for all subsequent requests

## Production Considerations

### Security
- Never expose API keys in client-side code
- Use environment variables for sensitive configuration
- Implement proper CORS policies
- Monitor API usage and rate limiting

### Performance
- Cache OpenAPI specification
- Use CDN for Swagger UI assets
- Monitor documentation load times
- Optimize large response examples

### Maintenance
- Keep documentation synchronized with code changes
- Regular review of examples and descriptions
- Update version information
- Monitor documentation feedback

## Troubleshooting

### Common Issues

1. **Missing Authentication**
   - Ensure X-API-Key header is included
   - Verify API key is valid and active

2. **Rate Limiting**
   - Check rate limit headers in responses
   - Implement exponential backoff
   - Consider request batching

3. **Validation Errors**
   - Review request schema in documentation
   - Check required vs optional fields
   - Validate data types and formats

### Debug Tools
- Browser Developer Tools for network inspection
- Postman collection import from OpenAPI spec
- cURL commands from Swagger UI
- SDK debugging with detailed logging

## Future Enhancements

- **WebSocket Documentation**: Real-time event streaming
- **Webhook Documentation**: Callback URL specifications
- **GraphQL Integration**: Alternative query interface
- **Multi-language Examples**: More SDK examples
- **Video Tutorials**: Interactive documentation walkthrough