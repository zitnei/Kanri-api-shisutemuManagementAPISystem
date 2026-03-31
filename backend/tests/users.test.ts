import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../src/app';

// Mock dependencies
vi.mock('../src/lib/prisma', () => ({
  prisma: {
    user: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
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

function createTestToken(permissions: string[] = ['users:read', 'users:write', 'users:delete']) {
  return jwt.sign(
    {
      sub: 'test-user-id',
      email: 'admin@kanri.dev',
      role: 'admin',
      permissions,
    },
    'test-secret-key-minimum-32-characters-long',
    { expiresIn: '1h' }
  );
}

describe('Users API', () => {
  describe('GET /api/v1/users', () => {
    it('should return 401 without token', async () => {
      const response = await request(app).get('/api/v1/users');
      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should return 403 with insufficient permissions', async () => {
      const token = createTestToken([]);
      const response = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });

    it('should return 200 with valid token and permissions', async () => {
      const { prisma } = await import('../src/lib/prisma');
      const mockUsers = [
        {
          id: '1',
          email: 'test@kanri.dev',
          name: 'Test User',
          nameKana: null,
          employeeCode: 'EMP001',
          avatarUrl: null,
          phone: null,
          isActive: true,
          deletedAt: null,
          departmentId: null,
          roleId: 'role-1',
          createdAt: new Date(),
          updatedAt: new Date(),
          role: { id: 'role-1', name: 'employee', displayName: '一般社員' },
          department: null,
        },
      ];

      vi.mocked(prisma.user.count).mockResolvedValueOnce(1);
      vi.mocked(prisma.user.findMany).mockResolvedValueOnce(mockUsers as never);

      const token = createTestToken(['users:read']);
      const response = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('POST /api/v1/users', () => {
    it('should return 400 for invalid user data', async () => {
      const token = createTestToken(['users:write', 'audit-logs:read']);
      const response = await request(app)
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${token}`)
        .send({
          email: 'invalid-email',
          name: '',
          employeeCode: '',
          roleId: 'some-role',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 201 for valid user data', async () => {
      const { prisma } = await import('../src/lib/prisma');
      const mockUser = {
        id: 'new-user-id',
        email: 'newuser@kanri.dev',
        name: '新規ユーザー',
        nameKana: null,
        employeeCode: 'EMP099',
        avatarUrl: null,
        phone: null,
        isActive: true,
        deletedAt: null,
        departmentId: null,
        roleId: 'role-id',
        createdAt: new Date(),
        updatedAt: new Date(),
        role: { id: 'role-id', name: 'employee', displayName: '一般社員' },
        department: null,
      };

      vi.mocked(prisma.user.create).mockResolvedValueOnce(mockUser as never);

      const token = createTestToken(['users:write', 'users:read']);
      const response = await request(app)
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${token}`)
        .send({
          email: 'newuser@kanri.dev',
          password: 'SecurePass1',
          name: '新規ユーザー',
          employeeCode: 'EMP099',
          roleId: 'role-id',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe('newuser@kanri.dev');
    });
  });

  describe('Response format', () => {
    it('should always include success field', async () => {
      const response = await request(app).get('/api/v1/nonexistent-route');
      expect(response.body).toHaveProperty('success');
    });
  });
});
