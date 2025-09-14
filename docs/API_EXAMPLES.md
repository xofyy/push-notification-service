# Push Notification Service API Examples

## Authentication

All API requests require authentication using an API key in the `X-API-Key` header:

```bash
curl -H "X-API-Key: your-project-api-key-here" \
  https://api.yourcompany.com/api/v1/projects
```

## Projects

### Create a Project

```bash
curl -X POST https://api.yourcompany.com/api/v1/projects \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "name": "My Mobile App",
    "description": "Push notifications for my mobile application",
    "settings": {
      "fcm": {
        "enabled": true,
        "serviceAccountKey": "{\\"type\\": \\"service_account\\", ...}"
      },
      "apns": {
        "enabled": true,
        "keyId": "your-key-id",
        "teamId": "your-team-id",
        "privateKey": "-----BEGIN PRIVATE KEY-----..."
      },
      "webPush": {
        "enabled": true,
        "vapidPublicKey": "your-vapid-public-key",
        "vapidPrivateKey": "your-vapid-private-key"
      }
    }
  }'
```

### Get Project Information

```bash
curl -H "X-API-Key: your-project-api-key" \
  https://api.yourcompany.com/api/v1/projects
```

## Device Management

### Register a Device

```bash
curl -X POST https://api.yourcompany.com/api/v1/projects/64f1a2b3c4d5e6f7a8b9c0d1/devices/register \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-project-api-key" \
  -d '{
    "token": "fcm_device_token_here",
    "platform": "android",
    "userId": "user123",
    "tags": ["premium", "beta-tester"],
    "properties": {
      "appVersion": "1.2.3",
      "deviceModel": "Pixel 7",
      "osVersion": "13"
    }
  }'
```

### Validate Device Token

```bash
curl -X POST https://api.yourcompany.com/api/v1/projects/64f1a2b3c4d5e6f7a8b9c0d1/devices/validate-token \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-project-api-key" \
  -d '{
    "token": "fcm_device_token_here",
    "platform": "android"
  }'
```

## Sending Notifications

### Simple Push Notification

```bash
curl -X POST https://api.yourcompany.com/api/v1/projects/64f1a2b3c4d5e6f7a8b9c0d1/notifications/send \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-project-api-key" \
  -d '{
    "title": "Welcome!",
    "body": "Thanks for installing our app!",
    "targetTags": ["new-users"]
  }'
```

### Rich Notification with Image and Action

```bash
curl -X POST https://api.yourcompany.com/api/v1/projects/64f1a2b3c4d5e6f7a8b9c0d1/notifications/send \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-project-api-key" \
  -d '{
    "title": "Flash Sale!",
    "body": "50% off all premium features. Limited time offer!",
    "imageUrl": "https://example.com/images/sale.jpg",
    "actionUrl": "https://example.com/sale",
    "data": {
      "campaignId": "flash_sale_2023",
      "discountCode": "FLASH50"
    },
    "targetTags": ["premium", "active"]
  }'
```

### Scheduled Notification

```bash
curl -X POST https://api.yourcompany.com/api/v1/projects/64f1a2b3c4d5e6f7a8b9c0d1/notifications/send \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-project-api-key" \
  -d '{
    "title": "Daily Reminder",
    "body": "Don'\''t forget to check your daily tasks!",
    "scheduledFor": "2023-12-08T09:00:00.000Z",
    "targetTags": ["daily-reminders"]
  }'
```

### Recurring Notification

```bash
curl -X POST https://api.yourcompany.com/api/v1/projects/64f1a2b3c4d5e6f7a8b9c0d1/notifications/send \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-project-api-key" \
  -d '{
    "title": "Weekly Newsletter",
    "body": "Your weekly digest is ready!",
    "recurring": {
      "pattern": "0 9 * * MON",
      "timezone": "America/New_York",
      "endDate": "2024-12-31T23:59:59.000Z"
    },
    "targetTags": ["newsletter-subscribers"]
  }'
```

### Segmented Notification

```bash
curl -X POST https://api.yourcompany.com/api/v1/projects/64f1a2b3c4d5e6f7a8b9c0d1/notifications/send \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-project-api-key" \
  -d '{
    "title": "Update Available",
    "body": "A new version of the app is available!",
    "targetQuery": {
      "platform": "android",
      "properties.appVersion": { "$lt": "2.0.0" },
      "lastSeen": { "$gte": "2023-12-01T00:00:00.000Z" }
    }
  }'
```

## Templates

### Create a Template

```bash
curl -X POST https://api.yourcompany.com/api/v1/projects/64f1a2b3c4d5e6f7a8b9c0d1/templates \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-project-api-key" \
  -d '{
    "name": "welcome-template",
    "title": "Welcome {{userName}}!",
    "body": "Thanks for joining {{appName}}. You'\''re {{ordinalNumber}} user!",
    "category": "onboarding",
    "language": "en",
    "variables": [
      {
        "name": "userName",
        "type": "string",
        "required": true,
        "description": "User'\''s display name"
      },
      {
        "name": "appName",
        "type": "string",
        "required": true,
        "description": "Application name"
      },
      {
        "name": "ordinalNumber",
        "type": "string",
        "required": false,
        "description": "User'\''s position (1st, 2nd, etc.)"
      }
    ]
  }'
```

### Send Template-based Notification

```bash
curl -X POST https://api.yourcompany.com/api/v1/projects/64f1a2b3c4d5e6f7a8b9c0d1/notifications/send \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-project-api-key" \
  -d '{
    "templateId": "64f1a2b3c4d5e6f7a8b9c0d4",
    "templateVariables": {
      "userName": "John Doe",
      "appName": "AwesomeApp",
      "ordinalNumber": "1,234th"
    },
    "targetDevices": ["device_123"]
  }'
```

## Analytics

### Track Custom Events

```bash
curl -X POST https://api.yourcompany.com/api/v1/projects/64f1a2b3c4d5e6f7a8b9c0d1/analytics/events \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-project-api-key" \
  -d '{
    "eventType": "notification_clicked",
    "deviceId": "device_123",
    "notificationId": "64f1a2b3c4d5e6f7a8b9c0d2",
    "properties": {
      "campaignId": "welcome_series_1",
      "buttonClicked": "cta_button",
      "timeToClick": 5.2
    },
    "timestamp": "2023-12-07T16:35:00.000Z"
  }'
```

### Get Analytics Overview

```bash
curl -H "X-API-Key: your-project-api-key" \
  "https://api.yourcompany.com/api/v1/projects/64f1a2b3c4d5e6f7a8b9c0d1/analytics/overview?startDate=2023-12-01&endDate=2023-12-07"
```

## Rate Limiting

All endpoints are rate-limited. Check the response headers for rate limit information:

```bash
curl -I -H "X-API-Key: your-project-api-key" \
  https://api.yourcompany.com/api/v1/projects

# Response headers:
# X-RateLimit-Limit: 1000
# X-RateLimit-Remaining: 999
# X-RateLimit-Reset: 1701964800
# X-RateLimit-Window: 3600
```

### Rate Limit Exceeded Response

```json
{
  "statusCode": 429,
  "message": "Too many requests. Limit: 100 requests per minute.",
  "error": "Too Many Requests",
  "retryAfter": 45
}
```

## Error Responses

### Validation Error

```json
{
  "statusCode": 400,
  "message": [
    "title should not be empty",
    "recipients must be an array"
  ],
  "error": "Bad Request"
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

### Access Denied

```json
{
  "statusCode": 403,
  "message": "Access denied to this project",
  "error": "Forbidden"
}
```

## SDKs and Libraries

### JavaScript/Node.js

```javascript
const PushNotificationService = require('@yourcompany/push-notification-sdk');

const client = new PushNotificationService({
  apiKey: 'your-project-api-key',
  baseUrl: 'https://api.yourcompany.com/api/v1'
});

// Send notification
await client.notifications.send({
  title: 'Hello!',
  body: 'This is a test notification',
  targetTags: ['test-users']
});
```

### Python

```python
from push_notification_service import Client

client = Client(api_key='your-project-api-key')

# Send notification
response = client.notifications.send({
    'title': 'Hello!',
    'body': 'This is a test notification',
    'target_tags': ['test-users']
})
```

### PHP

```php
<?php
use PushNotificationService\Client;

$client = new Client('your-project-api-key');

// Send notification
$response = $client->notifications->send([
    'title' => 'Hello!',
    'body' => 'This is a test notification',
    'targetTags' => ['test-users']
]);
?>
```