import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Kanri API System',
      version: '1.0.0',
      description: '管理APIシステム - Production-grade management API with authentication, RBAC, and audit logging',
      contact: {
        name: 'Kanri System',
        email: 'admin@kanri.dev',
      },
    },
    servers: [
      {
        url: '/api/v1',
        description: 'API v1',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object', nullable: true },
            error: {
              type: 'object',
              nullable: true,
              properties: {
                code: { type: 'string' },
                message: { type: 'string' },
              },
            },
            meta: {
              type: 'object',
              nullable: true,
              properties: {
                total: { type: 'number' },
                page: { type: 'number' },
                limit: { type: 'number' },
                cursor: { type: 'string', nullable: true },
              },
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            nameKana: { type: 'string', nullable: true },
            employeeCode: { type: 'string' },
            avatarUrl: { type: 'string', nullable: true },
            phone: { type: 'string', nullable: true },
            isActive: { type: 'boolean' },
            departmentId: { type: 'string', nullable: true },
            roleId: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Department: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            code: { type: 'string' },
            name: { type: 'string' },
            parentId: { type: 'string', nullable: true },
            managerId: { type: 'string', nullable: true },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        ApprovalRequest: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            requesterId: { type: 'string' },
            approverId: { type: 'string', nullable: true },
            type: { type: 'string', enum: ['VACATION', 'EXPENSE', 'OVERTIME', 'OTHER'] },
            title: { type: 'string' },
            description: { type: 'string', nullable: true },
            status: { type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED'] },
            startDate: { type: 'string', format: 'date-time', nullable: true },
            endDate: { type: 'string', format: 'date-time', nullable: true },
            amount: { type: 'number', nullable: true },
            comment: { type: 'string', nullable: true },
            reviewedAt: { type: 'string', format: 'date-time', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        AuditLog: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            userId: { type: 'string', nullable: true },
            action: { type: 'string' },
            resource: { type: 'string' },
            resourceId: { type: 'string', nullable: true },
            oldValue: { type: 'object', nullable: true },
            newValue: { type: 'object', nullable: true },
            ipAddress: { type: 'string', nullable: true },
            userAgent: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    security: [{ BearerAuth: [] }],
  },
  apis: ['./src/modules/**/*.routes.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
