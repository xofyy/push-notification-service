# 🚀 Push Notification Service

> **Enterprise-level push notification system built with NestJS, supporting iOS, Android, and Web push notifications with advanced device management and segmentation capabilities.**

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)]()
[![TypeScript](https://img.shields.io/badge/typescript-5.7.3-blue)]()
[![NestJS](https://img.shields.io/badge/nestjs-11.0.1-red)]()
[![MongoDB](https://img.shields.io/badge/mongodb-atlas-green)]()
[![Redis](https://img.shields.io/badge/redis-upstash-red)]()

## 📋 Table of Contents

- [🎯 Overview](#-overview)
- [✨ Features](#-features)
- [🏗️ Architecture](#️-architecture)
- [🚀 Quick Start](#-quick-start)
- [⚙️ Configuration](#️-configuration)
- [🔧 API Documentation](#-api-documentation)
- [📱 Platform Setup](#-platform-setup)
- [🧪 Testing Guide](#-testing-guide)
- [🔍 Monitoring](#-monitoring)
- [🚨 Troubleshooting](#-troubleshooting)
- [🤝 Contributing](#-contributing)
- [🧰 SDK Generation](#-sdk-generation)

## 🎯 Overview

The Push Notification Service is a comprehensive solution for sending push notifications across multiple platforms:

- **📱 iOS** - Apple Push Notification service (APNs) with P8 key authentication
- **🤖 Android** - Firebase Cloud Messaging (FCM) with Admin SDK
- **🌐 Web** - Web Push Protocol with VAPID keys

### Key Capabilities

- **Multi-tenant architecture** supporting unlimited projects
- **Advanced device segmentation** with complex query engine
- **Automatic platform detection** from device tokens
- **Comprehensive error handling** with retry mechanisms
- **Real-time analytics** and delivery tracking
- **Enterprise-grade reliability** with 99.9% uptime target

## ✨ Features

### 🔥 Core Features (Implemented)

- [x] **Multi-Platform Support** - iOS, Android, Web push notifications
- [x] **Device Management** - Registration, validation, token refresh
- [x] **User Segmentation** - Complex queries with 10+ operators
- [x] **Properties & Tags** - Flexible device metadata system
- [x] **Batch Processing** - Efficient bulk operations
- [x] **Error Handling** - Intelligent retry with exponential backoff
- [x] **Token Validation** - Platform-specific format checking
- [x] **Health Monitoring** - Comprehensive system status
- [x] **Analytics** - Device statistics and usage metrics

### ✅ Queue System (Sprint 4)

- [x] **BullMQ Integration** - Enterprise job queue with Redis
- [x] **Multiple Queue Types** - Immediate, scheduled, batch, and recurring
- [x] **Job Processing** - Dedicated processors with priority handling
- [x] **Scheduling** - Delayed notifications with timezone support
- [x] **Batch Operations** - Bulk notification processing
- [x] **Job Monitoring** - Status tracking and health checks
- [x] **Auto Cleanup** - Scheduled cleanup of completed jobs
- [x] **Error Handling** - Exponential backoff and retry logic

### ✅ Template System (Sprint 5)

- [x] **Template CRUD Operations** - Create, read, update, delete templates
- [x] **Variable Substitution** - Handlebars-style {{variable}} syntax
- [x] **Template Validation** - Syntax validation and variable checking
- [x] **Multi-Language Support** - Language-specific templates
- [x] **Usage Statistics** - Template analytics and performance tracking
- [x] **Notifications Integration** - Seamless template rendering during notification sending

### 🚧 Roadmap Features
- [x] **Advanced Analytics** - Real-time dashboards (Sprint 6) ✅
- [ ] **REST API** - Complete external API (Sprint 7)
- [ ] **Admin Dashboard** - Web-based management interface (Sprint 9)
- [ ] **Client SDKs** - JavaScript, Python, PHP libraries (Sprint 10)

## 🏗️ Architecture

### System Components

```mermaid
graph TB
    A[Client Applications] --> B[NestJS API Server]
    B --> C[MongoDB Atlas]
    B --> D[Upstash Redis]
    B --> Q[BullMQ Queue System]
    Q --> E[FCM Service]
    Q --> F[APNs Service]
    Q --> G[Web Push Service]
    E --> H[Firebase Cloud Messaging]
    F --> I[Apple Push Notification service]
    G --> J[Browser Push Services]
    Q --> K[Job Processors]
    K --> L[Scheduled Jobs]
    K --> M[Batch Jobs]
    K --> N[Recurring Jobs]
```

### Tech Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Backend** | NestJS 11 + TypeScript | API server and business logic |
| **Database** | MongoDB Atlas (Free Tier) | Device and project data |
| **Cache** | Upstash Redis (Free Tier) | Session cache and job queue |
| **Queue System** | BullMQ + Redis | Job processing and scheduling |
| **Push Services** | FCM, APNs, Web Push | Multi-platform notification delivery |
| **Validation** | Joi + class-validator | Input validation and schema validation |
| **Testing** | Jest | Unit and integration testing |

### Project Structure

```
apps/api/src/
├── config/                 # Configuration management
│   ├── database.config.ts   # MongoDB Atlas configuration
│   ├── redis.config.ts      # Upstash Redis configuration
│   └── fcm.config.ts        # Firebase configuration
├── common/                  # Shared utilities
│   ├── redis/              # Redis service and connection
│   ├── queue/              # BullMQ queue system and processors
│   └── error-handling/     # Retry service and error classification
├── modules/                # Feature modules
│   ├── projects/           # Multi-tenant project management
│   ├── devices/            # Device lifecycle and segmentation
│   ├── notifications/      # Notification creation and history
│   ├── templates/          # Dynamic notification templates
│   └── queues/             # Queue management and job control
└── providers/              # Push notification providers
    ├── fcm/                # Firebase Cloud Messaging
    ├── apns/               # Apple Push Notifications
    ├── webpush/            # Web Push Protocol
    └── notification/       # Unified notification service
```

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+**
- **npm** or **yarn**
- **MongoDB Atlas account** (free tier)
- **Upstash Redis account** (free tier)
- **Firebase project** (for FCM)
- **Apple Developer account** (for APNs, optional)

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd push-notification-service/apps/api
   npm install
   ```

2. **Environment setup:**
   ```bash
   cp .env.example .env
   ```

3. **Configure environment variables** (see [Configuration](#️-configuration))

4. **Start the development server:**
   ```bash
   npm run start:dev
   ```

5. **Verify installation:**
   ```bash
   curl http://localhost:3000/api/v1/health
   ```

### Docker Setup (Alternative)

```bash
# Start with Docker Compose
docker-compose up -d

# Check logs
docker-compose logs -f api
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the `apps/api` directory:

```env
# Application
NODE_ENV=development
PORT=3000
API_VERSION=v1

# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/push-notifications?retryWrites=true&w=majority

# Redis Configuration (Upstash)
UPSTASH_REDIS_URL=rediss://default:password@host:port
UPSTASH_REDIS_TOKEN=your_upstash_token

# Firebase Cloud Messaging (FCM)
FCM_ENABLED=true
FCM_PROJECT_ID=your-firebase-project-id
FCM_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"..."}

# Apple Push Notification Service (APNs)
APNS_ENABLED=true
APNS_KEY_ID=your-key-id
APNS_TEAM_ID=your-team-id
APNS_BUNDLE_ID=com.yourapp.bundleid
APNS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
APNS_PRODUCTION=false

# Web Push Configuration
WEBPUSH_ENABLED=true
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_SUBJECT=mailto:your-email@example.com

# Features
FEATURES_WEBHOOKS=true
FEATURES_ANALYTICS=true
FEATURES_SCHEDULING=true

# CORS
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com
```

### Free Tier Limits

| Service | Free Limit | Current Usage | Monitoring |
|---------|------------|---------------|------------|
| MongoDB Atlas | 512MB storage | ~5% | [Atlas Dashboard](https://cloud.mongodb.com) |
| Upstash Redis | 10K commands/day | ~1% | [Upstash Console](https://console.upstash.com) |
| Firebase FCM | Unlimited messages | N/A | [Firebase Console](https://console.firebase.google.com) |
| APNs | Unlimited messages | N/A | Apple Developer Portal |
| Web Push | Unlimited messages | N/A | Browser dev tools |

## 🔧 API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication
Currently using API key-based authentication per project. Include the project API key in requests:

```http
X-API-Key: your-project-api-key
```

### Core Endpoints

#### Health Check
```http
GET /health
```
**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-19T14:49:45.092Z",
  "service": "push-notification-service",
  "version": "1.0.0",
  "uptime": 127.9447813,
  "environment": "development",
  "database": {
    "status": "connected",
    "name": "test"
  },
  "redis": {
    "status": "connected",
    "type": "upstash",
    "connected": true
  },
  "pushProviders": {
    "fcm": { "available": true, "projectId": "your-project" },
    "apns": { "available": true, "production": false, "topic": "com.app.bundle" },
    "webPush": { "available": true, "publicKey": "BK...", "subject": "mailto:..." },
    "unified": { "available": true, "availablePlatforms": ["ios", "android", "web"] }
  }
}
```

---

### 📱 Project Management

#### Create Project
```http
POST /projects
Content-Type: application/json

{
  "name": "My App",
  "description": "My awesome mobile app",
  "settings": {
    "timezone": "UTC",
    "defaultLanguage": "en"
  }
}
```

#### Get Project
```http
GET /projects/{projectId}
```

#### List Projects
```http
GET /projects
```

---

### 🎯 Device Management

#### Register Device (Enhanced)
```http
POST /projects/{projectId}/devices/register
Content-Type: application/json
User-Agent: MyApp/1.0 (iPhone; iOS 17.0)

{
  "token": "device-token-here",
  "platform": "ios",  // Optional - auto-detected if not provided
  "userId": "user123",
  "tags": ["premium", "early-adopter"],
  "topics": ["news", "updates"],
  "properties": {
    "appVersion": "1.2.0",
    "language": "en",
    "subscription": "premium"
  },
  "metadata": {
    "deviceModel": "iPhone 15 Pro",
    "osVersion": "17.0",
    "timezone": "America/New_York"
  }
}
```

**Response:**
```json
{
  "_id": "65f123abc456789012345678",
  "projectId": "65f123abc456789012345677",
  "token": "device-token-here",
  "platform": "ios",
  "userId": "user123",
  "isActive": true,
  "tags": ["premium", "early-adopter"],
  "topics": ["news", "updates"],
  "properties": {
    "appVersion": "1.2.0",
    "language": "en",
    "subscription": "premium"
  },
  "metadata": {
    "deviceModel": "iPhone 15 Pro",
    "osVersion": "17.0",
    "timezone": "America/New_York"
  },
  "lastActiveAt": "2025-01-19T14:49:45.092Z",
  "notificationsSent": 0,
  "notificationsDelivered": 0,
  "notificationsOpened": 0,
  "createdAt": "2025-01-19T14:49:45.092Z",
  "updatedAt": "2025-01-19T14:49:45.092Z"
}
```

#### Validate Token
```http
POST /projects/{projectId}/devices/validate-token
Content-Type: application/json

{
  "token": "device-token-here",
  "platform": "ios"  // Optional
}
```

**Response:**
```json
{
  "valid": true,
  "detectedPlatform": "ios",
  "providedPlatform": "ios",
  "platformMatch": true,
  "tokenFormat": {
    "length": 64,
    "type": "APNs",
    "pattern": "hex_string"
  },
  "recommendations": [
    "Token format is valid for the detected platform."
  ]
}
```

#### Batch Token Validation
```http
POST /projects/{projectId}/devices/validate-tokens-batch
Content-Type: application/json

{
  "tokens": [
    { "token": "fcm-token-1", "platform": "android" },
    { "token": "apns-token-1", "platform": "ios" },
    { "token": "web-push-subscription", "platform": "web" }
  ]
}
```

#### Refresh Device Token
```http
POST /projects/{projectId}/devices/refresh-token
Content-Type: application/json

{
  "oldToken": "expired-token",
  "newToken": "new-valid-token"
}
```

#### Device Segmentation Query
```http
POST /projects/{projectId}/devices/segment/query
Content-Type: application/json

{
  "operator": "and",
  "platforms": {
    "platforms": ["ios", "android"]
  },
  "tags": {
    "tags": ["premium", "active"],
    "operator": "or"
  },
  "properties": [
    {
      "property": "appVersion",
      "operator": "greater_than",
      "value": "1.0.0"
    },
    {
      "property": "language",
      "operator": "in",
      "value": ["en", "es", "fr"]
    }
  ],
  "activity": {
    "lastActiveWithinDays": 30,
    "minNotificationsOpened": 1
  },
  "isActive": true,
  "limit": 100,
  "sortBy": "lastActiveAt",
  "sortOrder": "desc"
}
```

#### Test Segment Query (Dry Run)
```http
POST /projects/{projectId}/devices/segment/test
Content-Type: application/json

{
  "platforms": { "platforms": ["ios"] },
  "tags": { "tags": ["premium"] }
}
```

**Response:**
```json
{
  "estimatedCount": 1250,
  "sampleDevices": [
    {
      "_id": "65f123abc456789012345678",
      "platform": "ios",
      "tags": ["premium", "active"],
      "lastActiveAt": "2025-01-19T14:49:45.092Z"
    }
  ],
  "query": {
    "projectId": "ObjectId(...)",
    "$and": [
      { "platform": { "$in": ["ios"] } },
      { "tags": { "$in": ["premium"] } }
    ]
  },
  "queryExplanation": "Platform: ios AND Tags: any of [premium]"
}
```

#### Device Properties Management
```http
# Set properties (replaces all)
PUT /projects/{projectId}/devices/{deviceId}/properties
{
  "properties": {
    "subscription": "premium",
    "language": "en",
    "theme": "dark"
  }
}

# Update properties (merge with existing)
PATCH /projects/{projectId}/devices/{deviceId}/properties
{
  "properties": {
    "lastPurchase": "2025-01-19",
    "totalSpent": 99.99
  }
}

# Remove specific properties
DELETE /projects/{projectId}/devices/{deviceId}/properties
{
  "propertyKeys": ["temporaryFlag", "oldData"]
}
```

#### Device Tags Management
```http
# Add tags
POST /projects/{projectId}/devices/{deviceId}/tags
{
  "tags": ["new-user", "onboarding"]
}

# Remove tags
DELETE /projects/{projectId}/devices/{deviceId}/tags
{
  "tags": ["temporary", "expired"]
}
```

---

### 🔔 Notification Sending

#### Send Unified Notification
```http
POST /projects/{projectId}/notifications/send
Content-Type: application/json

{
  "payload": {
    "title": "Welcome to Our App!",
    "body": "Thanks for downloading our app. Get started now!",
    "imageUrl": "https://example.com/welcome.png",
    "data": {
      "action": "welcome",
      "userId": "123",
      "deep_link": "myapp://welcome"
    },
    "actions": [
      {
        "action": "view",
        "title": "Get Started",
        "icon": "https://example.com/icon.png"
      }
    ],
    "priority": "high"
  },
  "targeting": {
    "segment": {
      "tags": { "tags": ["new-user"] },
      "platforms": { "platforms": ["ios", "android"] }
    }
  },
  "options": {
    "dryRun": false,
    "sendAt": "2025-01-19T15:00:00Z"  // Optional scheduled send
  }
}
```

#### Send to Specific Devices
```http
POST /projects/{projectId}/notifications/send
Content-Type: application/json

{
  "payload": {
    "title": "Personal Message",
    "body": "This is just for you!"
  },
  "targeting": {
    "deviceIds": [
      "65f123abc456789012345678",
      "65f123abc456789012345679"
    ]
  }
}
```

#### Send to Topic
```http
POST /projects/{projectId}/notifications/send
Content-Type: application/json

{
  "payload": {
    "title": "Breaking News",
    "body": "Important update for all news subscribers"
  },
  "targeting": {
    "topics": ["news", "updates"]
  }
}
```

---

### 🔄 Queue System & Job Management

#### Add Queue Job
```http
POST /projects/{projectId}/queues/jobs
Content-Type: application/json

{
  "type": "immediate",  // immediate | scheduled | batch | recurring
  "payload": {
    "title": "Queue Test Notification",
    "body": "Testing the queue system",
    "priority": "high",
    "data": {
      "action": "queue_test",
      "timestamp": "2025-01-19T15:00:00Z"
    }
  },
  "targeting": {
    "deviceIds": ["device-id-1", "device-id-2"],
    "segment": {
      "tags": { "tags": ["premium"] }
    },
    "topics": ["news", "updates"]
  },
  "options": {
    "dryRun": false,
    "trackDelivery": true
  }
}
```

**Response:**
```json
{
  "id": "queue_job_123",
  "name": "notification",
  "data": { /* job data */ },
  "opts": {
    "priority": 3,
    "attempts": 3,
    "delay": 0
  },
  "timestamp": "2025-01-19T15:00:00.000Z",
  "processedOn": null,
  "finishedOn": null
}
```

#### Scheduled Job
```http
POST /projects/{projectId}/queues/jobs
Content-Type: application/json

{
  "type": "scheduled",
  "payload": {
    "title": "Scheduled Marketing Campaign",
    "body": "Don't miss our weekend sale!"
  },
  "targeting": {
    "segment": {
      "tags": { "tags": ["marketing_opt_in"] }
    }
  },
  "schedule": {
    "sendAt": "2025-01-20T09:00:00Z",
    "timezone": "America/New_York"
  }
}
```

#### Recurring Job
```http
POST /projects/{projectId}/queues/jobs
Content-Type: application/json

{
  "type": "recurring",
  "payload": {
    "title": "Daily Reminder",
    "body": "Time for your daily check-in!"
  },
  "targeting": {
    "segment": {
      "properties": [{
        "property": "subscription",
        "operator": "equals",
        "value": "premium"
      }]
    }
  },
  "schedule": {
    "type": "cron",
    "value": "0 9 * * *",  // Every day at 9 AM
    "timezone": "UTC",
    "startDate": "2025-01-19T00:00:00Z",
    "endDate": "2025-12-31T23:59:59Z",
    "maxExecutions": 365
  }
}
```

#### Batch Job
```http
POST /projects/{projectId}/queues/jobs
Content-Type: application/json

{
  "type": "batch",
  "payload": [
    {
      "title": "Welcome Message 1",
      "body": "Welcome to our service!"
    },
    {
      "title": "Welcome Message 2", 
      "body": "Here's how to get started"
    }
  ],
  "targeting": {
    "deviceIds": ["new-user-1", "new-user-2", "new-user-3"]
  },
  "batch": {
    "batchSize": 50,
    "delayBetweenBatches": 2000  // 2 seconds
  }
}
```

#### Get Job Status
```http
GET /projects/{projectId}/queues/jobs/{queueName}/{jobId}/status
```

**Response:**
```json
{
  "status": "completed",
  "progress": 100,
  "data": {
    "projectId": "project-123",
    "payload": { /* notification payload */ }
  },
  "result": {
    "jobId": "queue_job_123",
    "status": "completed",
    "results": {
      "totalTargets": 150,
      "successCount": 145,
      "failureCount": 5,
      "deliveryRate": 96.67
    },
    "timestamp": "2025-01-19T15:05:30.123Z"
  }
}
```

#### Cancel Job
```http
DELETE /projects/{projectId}/queues/jobs/{queueName}/{jobId}
```

**Response:**
```json
{
  "success": true,
  "message": "Job queue_job_123 cancelled successfully"
}
```

#### Queue Statistics
```http
GET /projects/{projectId}/queues/stats?queue=notification-queue
```

**Response:**
```json
{
  "name": "notification-queue",
  "counts": {
    "waiting": 25,
    "active": 3,
    "completed": 1250,
    "failed": 12,
    "delayed": 8
  },
  "jobs": {
    "waiting": [
      {
        "id": "job_456",
        "name": "notification",
        "data": { /* job data */ },
        "opts": { "priority": 5 }
      }
    ],
    "active": [
      {
        "id": "job_789",
        "name": "notification", 
        "progress": 65
      }
    ],
    "failed": [
      {
        "id": "job_101",
        "name": "notification",
        "error": "Connection timeout"
      }
    ]
  }
}
```

#### Queue Health Check
```http
GET /projects/{projectId}/queues/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-19T15:00:00.000Z",
  "queues": [
    {
      "name": "notification-queue",
      "status": "healthy",
      "counts": {
        "waiting": 12,
        "active": 2,
        "completed": 850,
        "failed": 5,
        "delayed": 3
      }
    },
    {
      "name": "scheduled-queue", 
      "status": "healthy",
      "counts": {
        "waiting": 45,
        "active": 0,
        "completed": 200,
        "failed": 2,
        "delayed": 45
      }
    }
  ]
}
```

#### Pause/Resume Queue
```http
# Pause queue
POST /projects/{projectId}/queues/{queueName}/pause

# Resume queue  
POST /projects/{projectId}/queues/{queueName}/resume
```

---

### 🎨 Template Management

#### Create Template
```http
POST /projects/{projectId}/templates
Content-Type: application/json

{
  "name": "welcome_template",
  "title": "Welcome {{userName}}!",
  "body": "Hi {{userName}}, welcome to {{appName}}! You have {{credits}} free credits.",
  "imageUrl": "https://myapp.com/images/welcome.png",
  "data": {
    "action": "{{welcomeAction}}",
    "userId": "{{userId}}"
  },
  "variables": ["userName", "appName", "credits", "welcomeAction", "userId"],
  "defaultValues": {
    "appName": "MyApp",
    "credits": 100
  },
  "validationRules": {
    "required": ["userName", "userId"],
    "formats": {
      "userId": "^[0-9a-fA-F]{24}$"
    },
    "ranges": {
      "credits": { "min": 0, "max": 10000 }
    }
  },
  "language": "en",
  "status": "active"
}
```

#### List Templates
```http
GET /projects/{projectId}/templates?status=active&language=en&limit=50&offset=0
```

#### Get Template by ID
```http
GET /projects/{projectId}/templates/{templateId}
```

#### Get Template by Name
```http
GET /projects/{projectId}/templates/name/{templateName}
```

#### Update Template
```http
PATCH /projects/{projectId}/templates/{templateId}
Content-Type: application/json

{
  "title": "Updated Welcome {{userName}}!",
  "body": "Hi {{userName}}, thanks for joining {{appName}}!",
  "updatedBy": "admin123"
}
```

#### Delete Template
```http
DELETE /projects/{projectId}/templates/{templateId}
```

#### Render Template with Variables
```http
POST /projects/{projectId}/templates/render
Content-Type: application/json

{
  "template": "welcome_template",
  "variables": {
    "userName": "John Doe",
    "appName": "AwesomeApp",
    "credits": 250,
    "welcomeAction": "onboard",
    "userId": "65f123abc456789012345678"
  },
  "preview": false
}
```

**Response:**
```json
{
  "title": "Welcome John Doe!",
  "body": "Hi John Doe, welcome to AwesomeApp! You have 250 free credits.",
  "imageUrl": "https://myapp.com/images/welcome.png",
  "data": {
    "action": "onboard",
    "userId": "65f123abc456789012345678"
  },
  "variables": {
    "userName": "John Doe",
    "appName": "AwesomeApp",
    "credits": 250,
    "welcomeAction": "onboard",
    "userId": "65f123abc456789012345678"
  }
}
```

#### Validate Template Syntax
```http
POST /projects/{projectId}/templates/validate
Content-Type: application/json

{
  "title": "Test {{userName}}",
  "body": "Hello {{userName}}, your {{itemType}} is ready!",
  "testVariables": {
    "userName": "Jane",
    "itemType": "order"
  }
}
```

**Response:**
```json
{
  "isValid": true,
  "variables": ["userName", "itemType"],
  "errors": [],
  "preview": {
    "title": "Test Jane",
    "body": "Hello Jane, your order is ready!"
  }
}
```

#### Template Usage Statistics
```http
GET /projects/{projectId}/templates/statistics
```

**Response:**
```json
{
  "totalTemplates": 25,
  "activeTemplates": 22,
  "totalUsage": 15750,
  "topTemplates": [
    {
      "name": "welcome_template",
      "usage": 5200,
      "successRate": 98.5
    },
    {
      "name": "order_confirmation",
      "usage": 3100,
      "successRate": 99.2
    }
  ],
  "languageDistribution": {
    "en": 15,
    "es": 5,
    "fr": 3,
    "default": 2
  }
}
```

#### Send Notification with Template
```http
POST /projects/{projectId}/notifications/send
Content-Type: application/json

{
  "templateId": "welcome_template",
  "templateVariables": {
    "userName": "Alice Johnson",
    "credits": 500
  },
  "targeting": {
    "segment": {
      "tags": { "tags": ["new-user"] }
    }
  },
  "type": "instant"
}
```

---

### 📊 Analytics & Statistics

#### Project Statistics
```http
GET /projects/{projectId}/stats
```

**Response:**
```json
{
  "devices": {
    "total": 10000,
    "active": 8500,
    "platforms": {
      "ios": 4500,
      "android": 4200,
      "web": 1300
    }
  },
  "notifications": {
    "sent": 50000,
    "delivered": 47500,
    "opened": 12000,
    "deliveryRate": 95.0,
    "openRate": 25.3
  }
}
```

#### Device Statistics
```http
GET /projects/{projectId}/devices/stats
```

#### Tag Statistics
```http
GET /projects/{projectId}/devices/tags/stats
```

**Response:**
```json
[
  { "tag": "premium", "count": 1250 },
  { "tag": "active", "count": 8500 },
  { "tag": "new-user", "count": 234 }
]
```

#### Property Statistics
```http
GET /projects/{projectId}/devices/properties/stats
```

**Response:**
```json
{
  "appVersion": {
    "count": 9800,
    "uniqueValues": 5,
    "sampleValues": ["1.0.0", "1.1.0", "1.2.0", "2.0.0"]
  },
  "language": {
    "count": 9500,
    "uniqueValues": 15,
    "sampleValues": ["en", "es", "fr", "de", "it"]
  }
}
```

---

### 🛠️ Administrative Endpoints

#### Token Cleanup
```http
POST /projects/{projectId}/devices/cleanup-tokens?dryRun=true
```

**Response:**
```json
{
  "checked": 10000,
  "invalid": 45,
  "removed": 0,  // 0 because dryRun=true
  "devices": [
    {
      "deviceId": "65f123abc456789012345678",
      "token": "invalid-token-preview...",
      "platform": "ios",
      "reason": "Invalid token format"
    }
  ]
}
```

#### Get All Project Tags
```http
GET /projects/{projectId}/devices/tags
```

**Response:**
```json
[
  "premium", "active", "new-user", "beta-tester", "vip"
]
```

## 📱 Platform Setup

### 🔥 Firebase Cloud Messaging (FCM) Setup

1. **Create Firebase Project:**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create new project or use existing
   - Enable Cloud Messaging

2. **Generate Service Account Key:**
   - Go to Project Settings → Service Accounts
   - Generate new private key (JSON format)
   - Add the JSON content to `FCM_SERVICE_ACCOUNT_KEY` environment variable

3. **Test FCM Token Format:**
   ```
   Example: dUlBT7ZQSE6:APA91bH...very-long-token
   Length: ~152+ characters
   Pattern: instanceId:tokenPart
   ```

### 🍎 Apple Push Notifications (APNs) Setup

1. **Apple Developer Account:**
   - Requires paid Apple Developer Program membership ($99/year)
   - Create App ID with Push Notifications capability

2. **Create APNs Key:**
   - Go to Certificates, Identifiers & Profiles
   - Keys → Create new APNs Auth Key
   - Download `.p8` file
   - Note Key ID and Team ID

3. **Environment Variables:**
   ```env
   APNS_KEY_ID=ABC123DEF4
   APNS_TEAM_ID=XYZ789GHI0
   APNS_BUNDLE_ID=com.yourcompany.yourapp
   APNS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
   APNS_PRODUCTION=false  # Set to true for production
   ```

4. **Test APNs Token Format:**
   ```
   Example: a1b2c3d4e5f67890123456789abcdef012345678901234567890abcdef012345
   Length: 64 characters (hex)
   Pattern: hexadecimal string
   ```

### 🌐 Web Push Setup

1. **Generate VAPID Keys:**
   ```bash
   npx web-push generate-vapid-keys
   ```

2. **Environment Variables:**
   ```env
   VAPID_PUBLIC_KEY=BKx...public-key
   VAPID_PRIVATE_KEY=private-key-here
   VAPID_SUBJECT=mailto:admin@yourcompany.com
   ```

3. **Client-Side Integration:**
   ```javascript
   // Service worker registration
   navigator.serviceWorker.register('/sw.js').then(registration => {
     return registration.pushManager.subscribe({
       userVisibleOnly: true,
       applicationServerKey: 'BKx...your-vapid-public-key'
     });
   }).then(subscription => {
     // Send subscription to your server
     fetch('/api/v1/projects/PROJECT_ID/devices/register', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
         token: JSON.stringify(subscription),
         platform: 'web'
       })
     });
   });
   ```

4. **Test Web Push Token Format:**
   ```json
   {
     "endpoint": "https://fcm.googleapis.com/fcm/send/...",
     "keys": {
       "p256dh": "BKx...",
       "auth": "abc123..."
     }
   }
   ```

## 🧪 Testing Guide

### Postman Collection

Import our comprehensive Postman collection:

1. **Download:** [Push Notification Service.postman_collection.json](./docs/postman/)
2. **Import** into Postman
3. **Set Environment Variables:**
   - `baseUrl`: `http://localhost:3000/api/v1`
   - `projectId`: Your project ID
   - `deviceId`: A test device ID

### Manual Testing Scenarios

#### Scenario 1: Device Registration Flow

1. **Create a project:**
   ```bash
   curl -X POST http://localhost:3000/api/v1/projects \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test App",
       "description": "Testing push notifications"
     }'
   ```

2. **Register a device:**
   ```bash
   curl -X POST http://localhost:3000/api/v1/projects/{projectId}/devices/register \
     -H "Content-Type: application/json" \
     -H "User-Agent: TestApp/1.0 (iPhone; iOS 17.0)" \
     -d '{
       "token": "test-fcm-token:very-long-token-here",
       "userId": "testuser123",
       "tags": ["test", "demo"],
       "properties": {
         "appVersion": "1.0.0",
         "environment": "testing"
       }
     }'
   ```

3. **Verify registration:**
   ```bash
   curl http://localhost:3000/api/v1/projects/{projectId}/devices/stats
   ```

#### Scenario 2: Segmentation Testing

1. **Test segment query:**
   ```bash
   curl -X POST http://localhost:3000/api/v1/projects/{projectId}/devices/segment/test \
     -H "Content-Type: application/json" \
     -d '{
       "tags": {
         "tags": ["test"],
         "operator": "or"
       },
       "platforms": {
         "platforms": ["android"]
       }
     }'
   ```

2. **Execute segment query:**
   ```bash
   curl -X POST http://localhost:3000/api/v1/projects/{projectId}/devices/segment/query \
     -H "Content-Type: application/json" \
     -d '{
       "tags": { "tags": ["test"] },
       "limit": 10
     }'
   ```

#### Scenario 3: Queue System Testing

1. **Create a project for testing:**
   ```bash
   curl -X POST http://localhost:3000/api/v1/projects \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Queue Test Project",
       "description": "Testing queue functionality"
     }'
   ```

2. **Test immediate notification job:**
   ```bash
   curl -X POST http://localhost:3000/api/v1/projects/{projectId}/queues/jobs \
     -H "Content-Type: application/json" \
     -d '{
       "type": "immediate",
       "payload": {
         "title": "Test Queue Job",
         "body": "Testing immediate notification via queue",
         "priority": "high"
       },
       "targeting": {
         "topics": ["test"]
       },
       "options": {
         "dryRun": true,
         "trackDelivery": true
       }
     }'
   ```

3. **Test scheduled notification:**
   ```bash
   curl -X POST http://localhost:3000/api/v1/projects/{projectId}/queues/jobs \
     -H "Content-Type: application/json" \
     -d '{
       "type": "scheduled",
       "payload": {
         "title": "Scheduled Test",
         "body": "This should arrive in 5 minutes"
       },
       "targeting": {
         "topics": ["scheduled-test"]
       },
       "schedule": {
         "sendAt": "'$(date -d "+5 minutes" -Iseconds)'",
         "timezone": "UTC"
       }
     }'
   ```

4. **Check job status:**
   ```bash
   curl http://localhost:3000/api/v1/projects/{projectId}/queues/jobs/notification-queue/{jobId}/status
   ```

5. **Monitor queue health:**
   ```bash
   curl http://localhost:3000/api/v1/projects/{projectId}/queues/health
   ```

6. **View queue statistics:**
   ```bash
   curl http://localhost:3000/api/v1/projects/{projectId}/queues/stats
   ```

#### Scenario 4: Token Validation

1. **Validate single token:**
   ```bash
   curl -X POST http://localhost:3000/api/v1/projects/{projectId}/devices/validate-token \
     -H "Content-Type: application/json" \
     -d '{
       "token": "test-token-here",
       "platform": "ios"
     }'
   ```

2. **Batch validation:**
   ```bash
   curl -X POST http://localhost:3000/api/v1/projects/{projectId}/devices/validate-tokens-batch \
     -H "Content-Type: application/json" \
     -d '{
       "tokens": [
         { "token": "fcm-token", "platform": "android" },
         { "token": "apns-token", "platform": "ios" }
       ]
     }'
   ```

#### Scenario 5: Template System Testing

1. **Create a template:**
   ```bash
   curl -X POST http://localhost:3000/api/v1/projects/{projectId}/templates \
     -H "Content-Type: application/json" \
     -d '{
       "name": "test_template",
       "title": "Hello {{userName}}!",
       "body": "Welcome to {{appName}}, you have {{credits}} credits.",
       "variables": ["userName", "appName", "credits"],
       "defaultValues": {
         "appName": "TestApp",
         "credits": 100
       },
       "validationRules": {
         "required": ["userName"]
       }
     }'
   ```

2. **Validate template syntax:**
   ```bash
   curl -X POST http://localhost:3000/api/v1/projects/{projectId}/templates/validate \
     -H "Content-Type: application/json" \
     -d '{
       "title": "Test {{userName}}",
       "body": "Your {{itemType}} is ready!",
       "testVariables": {
         "userName": "TestUser",
         "itemType": "order"
       }
     }'
   ```

3. **Render template with variables:**
   ```bash
   curl -X POST http://localhost:3000/api/v1/projects/{projectId}/templates/render \
     -H "Content-Type: application/json" \
     -d '{
       "template": "test_template",
       "variables": {
         "userName": "Alice",
         "credits": 500
       }
     }'
   ```

4. **Send notification with template:**
   ```bash
   curl -X POST http://localhost:3000/api/v1/projects/{projectId}/notifications/send \
     -H "Content-Type: application/json" \
     -d '{
       "templateId": "TEMPLATE_ID_HERE",
       "templateVariables": {
         "userName": "Bob",
         "credits": 250
       },
       "targeting": {
         "topics": ["test-users"]
       }
     }'
   ```

5. **Check template statistics:**
   ```bash
   curl http://localhost:3000/api/v1/projects/{projectId}/templates/statistics
   ```

### Automated Testing

#### Unit Tests
```bash
npm run test
```

#### Integration Tests
```bash
npm run test:e2e
```

#### Test Coverage
```bash
npm run test:cov
```

### Load Testing

#### Device Registration Load Test
```bash
# Using Artillery.js
npm install -g artillery
artillery quick --count 100 --num 10 http://localhost:3000/api/v1/health
```

#### Segmentation Performance Test
```bash
# Test complex queries with large datasets
curl -X POST http://localhost:3000/api/v1/projects/{projectId}/devices/segment/count \
  -H "Content-Type: application/json" \
  -d '{
    "properties": [
      {"property": "appVersion", "operator": "greater_than", "value": "1.0"},
      {"property": "language", "operator": "in", "value": ["en", "es"]}
    ],
    "activity": {"lastActiveWithinDays": 30}
  }'
```

## 🔍 Monitoring

### Health Monitoring

#### System Health
```bash
curl http://localhost:3000/api/v1/health | jq '.'
```

#### Database Status
```bash
# MongoDB connection
curl http://localhost:3000/api/v1/health | jq '.database'

# Redis connection  
curl http://localhost:3000/api/v1/health | jq '.redis'
```

#### Push Provider Status
```bash
# All providers
curl http://localhost:3000/api/v1/health | jq '.pushProviders'

# Specific provider
curl http://localhost:3000/api/v1/health | jq '.pushProviders.fcm'
```

### Performance Metrics

#### Response Time Monitoring
```bash
# Using curl with timing
curl -w "Total time: %{time_total}s\n" -o /dev/null -s http://localhost:3000/api/v1/health
```

#### Database Performance
```bash
# MongoDB Atlas Metrics
# Check via https://cloud.mongodb.com - Performance Advisor

# Query performance test
time curl -X POST http://localhost:3000/api/v1/projects/{projectId}/devices/segment/count \
  -H "Content-Type: application/json" \
  -d '{"platforms": {"platforms": ["ios"]}}'
```

### Logging

#### Application Logs
```bash
# Development logs
npm run start:dev

# Production logs (structured JSON)
NODE_ENV=production npm start
```

#### Log Levels
- **Error**: Critical errors, failed operations
- **Warn**: Invalid tokens, configuration issues
- **Log**: Successful operations, statistics
- **Debug**: Detailed operation info (dev only)

### Alerting Setup

#### Resource Usage Alerts

1. **MongoDB Atlas:**
   - Set alert at 80% storage (409MB of 512MB)
   - Monitor connection count and operation latency

2. **Upstash Redis:**
   - Set alert at 8K commands/day (80% of 10K limit)
   - Monitor memory usage and response time

3. **Application Metrics:**
   - Error rate > 1%
   - Response time > 200ms average
   - Failed notification delivery rate > 5%

## 🚨 Troubleshooting

### Common Issues

#### 1. Database Connection Issues

**Problem:** `MongooseError: Connection failed`

**Solutions:**
```bash
# Check connection string
echo $MONGODB_URI

# Test connectivity
curl -I https://your-cluster.mongodb.net

# Verify IP whitelist in MongoDB Atlas
# Add 0.0.0.0/0 for development (not recommended for production)
```

#### 2. Redis Connection Issues

**Problem:** `Redis connection timeout`

**Solutions:**
```bash
# Test Upstash Redis connection
curl -X POST $UPSTASH_REDIS_URL \
  -H "Authorization: Bearer $UPSTASH_REDIS_TOKEN" \
  -d '["PING"]'

# Check environment variables
echo $UPSTASH_REDIS_URL
echo $UPSTASH_REDIS_TOKEN
```

#### 3. FCM Configuration Issues

**Problem:** `FCM service not available`

**Solutions:**
```bash
# Verify service account key format
echo $FCM_SERVICE_ACCOUNT_KEY | jq '.'

# Check Firebase project settings
# Ensure Cloud Messaging API is enabled

# Test FCM token format
curl -X POST http://localhost:3000/api/v1/projects/{projectId}/devices/validate-token \
  -d '{"token": "your-fcm-token", "platform": "android"}'
```

#### 4. APNs Configuration Issues

**Problem:** `APNs service not available`

**Solutions:**
```bash
# Check P8 key format
echo $APNS_PRIVATE_KEY | grep "BEGIN PRIVATE KEY"

# Verify key IDs match
echo "Key ID: $APNS_KEY_ID"
echo "Team ID: $APNS_TEAM_ID"

# Test APNs token format (should be 64 hex chars)
curl -X POST http://localhost:3000/api/v1/projects/{projectId}/devices/validate-token \
  -d '{"token": "64-char-hex-string", "platform": "ios"}'
```

#### 5. Platform Detection Issues

**Problem:** `Cannot detect platform from token`

**Solutions:**
```bash
# Use explicit platform specification
curl -X POST http://localhost:3000/api/v1/projects/{projectId}/devices/register/basic \
  -d '{
    "token": "your-token",
    "platform": "ios"  // Explicitly specify platform
  }'

# Check token format validation
curl -X POST http://localhost:3000/api/v1/projects/{projectId}/devices/validate-token \
  -d '{"token": "your-token"}'
```

### Performance Issues

#### 1. Slow Segment Queries

**Problem:** Queries taking > 2 seconds

**Solutions:**
- Check indexes are being used:
  ```javascript
  // In MongoDB Atlas, use Performance Advisor
  // Or check query explain plan
  ```
- Optimize query structure:
  - Use `limit` parameter (max 1000)
  - Consider pagination with `skip`
  - Use specific field indexes

#### 2. High Memory Usage

**Problem:** Node.js process using > 512MB RAM

**Solutions:**
- Limit query results size
- Implement result streaming for large datasets
- Use MongoDB aggregation pipeline
- Monitor with:
  ```bash
  # Check Node.js memory usage
  curl http://localhost:3000/api/v1/health | jq '.memory'
  ```

### Debug Mode

Enable detailed logging:

```bash
# Development
DEBUG=* npm run start:dev

# Production (specific modules)
DEBUG=devices:*,notifications:* npm start
```

## 🤝 Contributing

### Development Setup

1. **Fork and clone:**
   ```bash
   git clone https://github.com/yourusername/push-notification-service.git
   cd push-notification-service/apps/api
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Setup pre-commit hooks:**
   ```bash
   npx husky install
   ```

4. **Run tests:**
   ```bash
   npm test
   ```

### Code Standards

- **TypeScript** strict mode enabled
- **ESLint** for code linting
- **Prettier** for code formatting
- **Jest** for testing
- **Conventional Commits** for commit messages

### Pull Request Process

1. Create feature branch: `git checkout -b feature/amazing-feature`
2. Make changes and add tests
3. Run full test suite: `npm run test:cov`
4. Commit with conventional format: `feat: add amazing feature`
5. Push and create pull request

### Project Roadmap

#### Current Sprint Status
- ✅ **Sprint 1**: Foundation (NestJS + MongoDB + Redis)
- ✅ **Sprint 2**: Push Providers (FCM + APNs + Web Push)  
- ✅ **Sprint 3**: Device Management (Registration + Segmentation)
- ✅ **Sprint 4**: Queue System (BullMQ + Job Processing)
- ✅ **Sprint 5**: Templates (Dynamic Notifications)
- ✅ **Sprint 6**: Analytics (Real-time Dashboards)

---

**Built with ❤️ using NestJS, TypeScript, and modern cloud technologies.**

## 🧰 SDK Generation

The API exports an OpenAPI specification in development at `apps/api/docs/openapi.json` on boot (see API logs). You can generate client SDKs directly from this file.

1) Ensure the API has run locally at least once:

```
cd apps/api
npm run start:dev
# OpenAPI will be exported to apps/api/docs/openapi.json
```

2) Generate a TypeScript (axios) client:

```
npx @openapitools/openapi-generator-cli generate \
  -i apps/api/docs/openapi.json \
  -g typescript-axios \
  -o sdk/typescript-axios
```

3) Generate a Python client:

```
npx @openapitools/openapi-generator-cli generate \
  -i apps/api/docs/openapi.json \
  -g python \
  -o sdk/python
```

Last updated: August 2025 | Version: 1.0.0
