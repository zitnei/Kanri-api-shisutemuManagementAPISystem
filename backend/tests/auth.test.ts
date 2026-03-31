import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import app from '../src/app';

// Mock dependencies
vi.mock('../src/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
    },
    loginHistory: {
      create: vi.fn(),
    },
    refreshToken: {
      create: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

vi.mock('../src/lib/redis', () => ({
  connectRedis: vi.fn(),
  getRedisClient: vi.fn(),
  disconnectRedis: vi.fn(),
}));

vi.mock('../src/config/env', () => ({
  env: {
    JWT_SECRET: 'test-secret-key-minimum-32-characters-long',
    JWT_REFRESH_SECRET: 'test-refresh-secret-key-minimum-32-characters',
    JWT_EXPIRES_IN: '15m',
    JWT_REFRESH_EXPIRES_IN: '7d',
    PORT: 3001,
    NODE_ENV: 'test',
    CORS_ORIGIN: 'http://localhost:3000',
    DATABASE_URL: 'postgresql://test:test@localhost/test',
    REDIS_URL: 'redis://localhost:6379',
  },
}));

describe('Auth API', () => {
  describe('POST /api/v1/auth/login', () => {
    it('should return 400 for missing email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ password: 'password123' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid email format', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'not-an-email', password: 'password123' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 for missing password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'admin@kanri.dev' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 401 for non-existent user', async () => {
      const { prisma } = await import('../src/lib/prisma');
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);
      vi.mocked(prisma.loginHistory.create).mockResolvedValueOnce({} as never);

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'nonexistent@kanri.dev', password: 'password123' });

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('should return 400 for missing refreshToken', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /health', () => {
    it('should return healthy status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
      expect(response.body.timestamp).toBeDefined();
    });
  });

  describe('404 handler', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app).get('/api/v1/nonexistent');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });
});
