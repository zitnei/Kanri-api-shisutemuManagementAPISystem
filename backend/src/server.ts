import 'dotenv/config';
import { env } from './config/env';
import app from './app';
import { prisma } from './lib/prisma';
import { connectRedis, disconnectRedis } from './lib/redis';
import { logger } from './lib/logger';

let isShuttingDown = false;

async function startServer() {
  try {
    // Connect to Redis
    await connectRedis();
    logger.info('Redis connected');

    // Verify Prisma connection
    await prisma.$connect();
    logger.info('Database connected');

    const server = app.listen(env.PORT, () => {
      logger.info(`Server running on port ${env.PORT} (${env.NODE_ENV})`);
      logger.info(`API docs available at http://localhost:${env.PORT}/api-docs`);
    });

    // Graceful shutdown handler
    async function shutdown(signal: string) {
      if (isShuttingDown) return;
      isShuttingDown = true;

      logger.info(`Received ${signal}, shutting down gracefully...`);

      server.close(async (err) => {
        if (err) {
          logger.error('Error closing HTTP server:', err);
          process.exit(1);
        }

        try {
          await prisma.$disconnect();
          logger.info('Prisma disconnected');

          await disconnectRedis();
          logger.info('Redis disconnected');

          logger.info('Graceful shutdown complete');
          process.exit(0);
        } catch (shutdownErr) {
          logger.error('Error during shutdown:', shutdownErr);
          process.exit(1);
        }
      });

      // Force exit after 30 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 30_000);
    }

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    process.on('uncaughtException', (err) => {
      logger.error('Uncaught exception:', err);
      shutdown('uncaughtException');
    });

    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled rejection:', reason);
      shutdown('unhandledRejection');
    });

    return server;
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
