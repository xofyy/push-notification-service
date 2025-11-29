import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global response transformer
  app.useGlobalInterceptors(new TransformInterceptor());

  // Security headers
  app.use(helmet());

  // Enable CORS
  app.enableCors({
    origin: configService.get('cors.allowedOrigins') || [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
    ],
    credentials: true,
  });

  // Global prefix for API routes
  app.setGlobalPrefix('api/v1');

  // Swagger/OpenAPI Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('Push Notification Service API')
    .setDescription(
      `
      Enterprise-grade Push Notification Service supporting iOS, Android, and Web platforms.
      
      ## Features
      - Multi-platform push notifications (FCM, APNs, Web Push)
      - Device management and segmentation
      - Template-based notifications with variable substitution
      - Real-time analytics and tracking
      - Rate limiting for API protections with variable substitution
      - High-performance queue system with BullMQ
      - Enterprise security with API key authentication
      - Rate limiting for API protection
      - 99.9% uptime reliability target
      
      ## Authentication
      All endpoints require an API key in the \`X-API-Key\` header.
      
      ## Rate Limiting
      API endpoints are rate-limited to ensure fair usage:
      - **High Frequency**: 100 requests/minute (notifications, events)
      - **Medium Frequency**: 300 requests/minute (device management)
      - **Low Frequency**: 1000 requests/hour (analytics, admin)
      
      Rate limit headers are included in all responses:
      - \`X-RateLimit-Limit\`: Maximum requests allowed
      - \`X-RateLimit-Remaining\`: Requests remaining in current window
      - \`X-RateLimit-Reset\`: Unix timestamp when the rate limit resets
    `,
    )
    .setVersion('1.0.0')
    .setContact(
      'Push Notification Service Team',
      'https://github.com/your-repo/push-notification-service',
      'support@yourcompany.com',
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addServer('http://localhost:3000', 'Development Server')
    .addServer('https://api.yourcompany.com', 'Production Server')
    .addApiKey(
      {
        type: 'apiKey',
        name: 'X-API-Key',
        in: 'header',
        description:
          'API Key for project authentication. Get your API key from the project dashboard.',
      },
      'ApiKeyAuth',
    )
    .addTag('Projects', 'Project management and configuration')
    .addTag('Devices', 'Device registration, validation, and management')
    .addTag('Notifications', 'Send and manage push notifications')
    .addTag('Templates', 'Notification templates with variable substitution')
    .addTag('Analytics', 'Analytics, tracking, and reporting')
    .addTag('Queues', 'Job queue management and monitoring')
    .addTag('Rate Limit Admin', 'Rate limiting administration and monitoring')
    .addTag('Health', 'System health and status endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey: string, methodKey: string) =>
      `${controllerKey.replace('Controller', '')}_${methodKey}`,
    deepScanRoutes: true,
  });

  // Setup Swagger UI
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Push Notification Service API Documentation',
    customfavIcon: '/favicon.ico',
    customCss: `
      .swagger-ui .topbar { display: none; }
      .swagger-ui .info .title { color: #1f2937; }
      .swagger-ui .scheme-container { background: #f8fafc; }
    `,
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      showRequestHeaders: true,
      tryItOutEnabled: true,
    },
  });

  const port = configService.get('port');
  const environment = configService.get('environment');

  // Export OpenAPI spec for external tools (Postman, etc.)
  if (environment === 'development') {
    try {
      const outputPath = join(process.cwd(), 'docs', 'openapi.json');
      const outputDir = dirname(outputPath);

      // Ensure docs directory exists
      if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true });
      }

      writeFileSync(outputPath, JSON.stringify(document, null, 2));
      console.log(`OpenAPI spec exported to: ${outputPath}`);
    } catch (error) {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      console.warn('Failed to export OpenAPI spec:', errorObj.message);
    }
  }

  await app.listen(port);

  const logger = new Logger('Bootstrap');
  logger.log(`Push Notification Service API running on port ${port}`);
  logger.log(`Environment: ${environment}`);
  logger.log(`Health check: http://localhost:${port}/api/v1/health`);
  logger.log(`API Documentation: http://localhost:${port}/api/docs`);
  logger.log(`Configuration loaded and validated`);
}
bootstrap();
