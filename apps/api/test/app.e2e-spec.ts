import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Push Notification Service (e2e)', () => {
  let app: INestApplication;
  let projectId: string;
  let deviceId: string;
  let apiKey: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.setGlobalPrefix('api/v1');

    await app.init();

    // Create a default project for all tests
    const response = await request(app.getHttpServer())
      .post('/api/v1/projects')
      .send({
        name: 'Default E2E Project',
        description: 'Project for E2E tests',
      })
      .expect(201);

    projectId = response.body._id;
    apiKey = response.body.apiKey;
    console.log(`✅ Created default project: ${projectId}, Key: ${apiKey}`);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health Check', () => {
    it('/api/v1/health (GET)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/health')
        .expect(200)
        .expect((res: any) => {
          if (res.body.status !== 'ok') {
            console.error('⚠️ Health Check Failed:', JSON.stringify(res.body, null, 2));
          }
          expect(res.body).toHaveProperty('status', 'ok');
          expect(res.body).toHaveProperty('database');
          expect(res.body).toHaveProperty('redis');
          expect(res.body.database.status).toBe('connected');
          expect(res.body.redis.status).toBe('connected');
        });
    });
  });

  describe('Projects', () => {
    it('/api/v1/projects (POST)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/projects')
        .send({
          name: 'Test Project E2E',
          description: 'Integration test project',
        })
        .expect(201)
        .expect((res: any) => {
          expect(res.body).toHaveProperty('name', 'Test Project E2E');
          expect(res.body).toHaveProperty('apiKey');
          expect(res.body).toHaveProperty('_id');
          expect(res.body.apiKey).toMatch(/^pns_[a-f0-9]{64}$/);
          // We don't overwrite global projectId/apiKey here to keep other tests stable
        });
    });

    it('/api/v1/projects (GET)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/projects')
        .set('X-API-Key', apiKey)
        .expect(200)
        .expect((res: any) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          const testProject = res.body.find(
            (p: any) => p.name === 'Default E2E Project',
          );
          expect(testProject).toBeDefined();
        });
    });

    it('/api/v1/projects/:id (GET)', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/projects/${projectId}`)
        .set('X-API-Key', apiKey)
        .expect(200)
        .expect((res: any) => {
          expect(res.body).toHaveProperty('name', 'Default E2E Project');
          expect(res.body).toHaveProperty('_id', projectId);
        });
    });
  });

  describe('Devices', () => {
    it('/api/v1/projects/:projectId/devices/register (POST)', () => {
      // Generate a valid-looking FCM token (100+ chars)
      const validToken = 'fcm_token_' + 'a'.repeat(100);

      return request(app.getHttpServer())
        .post(`/api/v1/projects/${projectId}/devices/register`)
        .set('X-API-Key', apiKey)
        .send({
          token: validToken,
          platform: 'android',
          metadata: {
            osVersion: 'Android 13',
            appVersion: '1.0.0-test',
          },
        })
        .expect(201)
        .expect((res: any) => {
          expect(res.body).toHaveProperty('token', validToken);
          expect(res.body).toHaveProperty('platform', 'android');
          expect(res.body).toHaveProperty('_id');
          expect(res.body.projectId).toBe(projectId);
          deviceId = res.body._id;
        });
    });

    it('/api/v1/projects/:projectId/devices (GET)', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/projects/${projectId}/devices`)
        .set('X-API-Key', apiKey)
        .expect(200)
        .expect((res: any) => {
          expect(res.body).toHaveProperty('items');
          expect(Array.isArray(res.body.items)).toBe(true);
          expect(res.body.items.length).toBeGreaterThan(0);
          const testDevice = res.body.items.find(
            (d: any) => d.token.startsWith('fcm_token_'),
          );
          expect(testDevice).toBeDefined();
        });
    });

    it('/api/v1/projects/:projectId/devices/stats (GET)', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/projects/${projectId}/devices/stats`)
        .set('X-API-Key', apiKey)
        .expect(200)
        .expect((res: any) => {
          expect(res.body).toHaveProperty('total');
          expect(res.body).toHaveProperty('active');
          expect(res.body).toHaveProperty('platforms');
          expect(res.body.total).toBeGreaterThan(0);
        });
    });
  });

  describe('Notifications', () => {
    it('/api/v1/projects/:projectId/notifications/send (POST)', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/projects/${projectId}/notifications/send`)
        .set('X-API-Key', apiKey)
        .send({
          title: 'E2E Test Notification',
          body: 'This is an integration test notification',
          type: 'instant',
          targetDevices: [deviceId],
        })
        .expect(201)
        .expect((res: any) => {
          expect(res.body).toHaveProperty('title', 'E2E Test Notification');
          expect(res.body).toHaveProperty('status', 'pending');
          expect(res.body).toHaveProperty('type', 'instant');
          expect(res.body.targetDevices).toContain(deviceId);
        });
    });

    it('/api/v1/projects/:projectId/notifications (GET)', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/projects/${projectId}/notifications`)
        .set('X-API-Key', apiKey)
        .expect(200)
        .expect((res: any) => {
          expect(res.body).toHaveProperty('items');
          expect(res.body).toHaveProperty('total');
          expect(Array.isArray(res.body.items)).toBe(true);
          expect(res.body.total).toBeGreaterThan(0);
        });
    });

    it('/api/v1/projects/:projectId/notifications/stats (GET)', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/projects/${projectId}/notifications/stats`)
        .set('X-API-Key', apiKey)
        .expect(200)
        .expect((res: any) => {
          expect(res.body).toHaveProperty('total');
          expect(res.body.total).toBeGreaterThan(0);
        });
    });
  });

  describe('Cleanup', () => {
    it('/api/v1/projects/:id (DELETE)', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/projects/${projectId}`)
        .set('X-API-Key', apiKey)
        .expect(204);
    });
  });
});
