import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
const request = require('supertest');
import { AppModule } from './../src/app.module';

describe('Push Notification Service (e2e)', () => {
  let app: INestApplication;
  let projectId: string;
  let deviceId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));
    app.setGlobalPrefix('api/v1');
    
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health Check', () => {
    it('/api/v1/health (GET)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/health')
        .expect(200)
        .expect((res) => {
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
          description: 'Integration test project'
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('name', 'Test Project E2E');
          expect(res.body).toHaveProperty('apiKey');
          expect(res.body).toHaveProperty('_id');
          expect(res.body.apiKey).toMatch(/^pns_[a-f0-9]{64}$/);
          projectId = res.body._id;
        });
    });

    it('/api/v1/projects (GET)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/projects')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          const testProject = res.body.find(p => p.name === 'Test Project E2E');
          expect(testProject).toBeDefined();
        });
    });

    it('/api/v1/projects/:id (GET)', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/projects/${projectId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('name', 'Test Project E2E');
          expect(res.body).toHaveProperty('_id', projectId);
        });
    });
  });

  describe('Devices', () => {
    it('/api/v1/projects/:projectId/devices/register (POST)', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/projects/${projectId}/devices/register`)
        .send({
          token: 'test_e2e_device_token',
          platform: 'android',
          metadata: {
            osVersion: 'Android 13',
            appVersion: '1.0.0-test'
          }
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('token', 'test_e2e_device_token');
          expect(res.body).toHaveProperty('platform', 'android');
          expect(res.body).toHaveProperty('_id');
          expect(res.body.projectId).toBe(projectId);
          deviceId = res.body._id;
        });
    });

    it('/api/v1/projects/:projectId/devices (GET)', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/projects/${projectId}/devices`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          const testDevice = res.body.find(d => d.token === 'test_e2e_device_token');
          expect(testDevice).toBeDefined();
        });
    });

    it('/api/v1/projects/:projectId/devices/stats (GET)', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/projects/${projectId}/devices/stats`)
        .expect(200)
        .expect((res) => {
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
        .send({
          title: 'E2E Test Notification',
          body: 'This is an integration test notification',
          type: 'instant',
          targetDevices: [deviceId]
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('title', 'E2E Test Notification');
          expect(res.body).toHaveProperty('status', 'pending');
          expect(res.body).toHaveProperty('type', 'instant');
          expect(res.body.targetDevices).toContain(deviceId);
        });
    });

    it('/api/v1/projects/:projectId/notifications (GET)', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/projects/${projectId}/notifications`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('notifications');
          expect(res.body).toHaveProperty('total');
          expect(Array.isArray(res.body.notifications)).toBe(true);
          expect(res.body.total).toBeGreaterThan(0);
        });
    });

    it('/api/v1/projects/:projectId/notifications/stats (GET)', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/projects/${projectId}/notifications/stats`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('total');
          expect(res.body.total).toBeGreaterThan(0);
        });
    });
  });

  describe('Cleanup', () => {
    it('/api/v1/projects/:id (DELETE)', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/projects/${projectId}`)
        .expect(204);
    });
  });
});
