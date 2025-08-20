import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

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

  // Enable CORS
  app.enableCors({
    origin: configService.get('cors.allowedOrigins'),
    credentials: true,
  });

  // Global prefix for API routes
  app.setGlobalPrefix('api/v1');

  const port = configService.get('port');
  const environment = configService.get('environment');

  await app.listen(port);

  console.log(`🚀 Push Notification Service API running on port ${port}`);
  console.log(`🌍 Environment: ${environment}`);
  console.log(`📋 Health check: http://localhost:${port}/api/v1/health`);
  console.log(`🔧 Configuration loaded and validated`);
}
bootstrap();
