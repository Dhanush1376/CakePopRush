import dotenv from 'dotenv';
dotenv.config();

import app from './src/app';
import connectDB, { disconnectDB } from './src/config/db';
import logger from './src/config/logger';

const PORT = Number(process.env.PORT) || 5000;

function validateProductionConfig() {
  if (process.env.NODE_ENV === 'production') {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    const required = ['OTP_SECRET', 'JWT_SECRET'];
    const missing = required.filter((key) => !process.env[key]);
    if (!mongoUri) {
      missing.push('MONGODB_URI (or MONGO_URI)');
    }
    if (missing.length > 0) {
      throw new Error(
        `[FATAL SECURITY CONFIG] Missing required production environment variables: ${missing.join(', ')}. Refusing to start server with insecure configuration.`
      );
    }
  }
}

async function bootstrap() {
  try {
    validateProductionConfig();
    await connectDB();

    const server = app.listen(PORT, () => {
      logger.info(`[SERVER] CakePopRush Backend listening on port ${PORT}`);
      logger.info(`[SERVER] Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    const shutdown = async (signal: string) => {
      logger.info(`[SERVER] Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        logger.info('[SERVER] HTTP server closed');
        try {
          await disconnectDB();
          logger.info('[SERVER] Database disconnected');
        } catch (dbErr: any) {
          logger.warn(`[SERVER] Error closing database: ${dbErr.message}`);
        }
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err: any) {
    logger.error(`[FATAL] Failed to start server: ${err.message}`, err);
    process.exit(1);
  }
}

bootstrap();
