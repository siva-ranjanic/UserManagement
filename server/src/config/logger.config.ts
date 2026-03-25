import { ConsoleLogger } from '@nestjs/common';

export const loggerConfig = {
  // You can extend this for Winston or other logging libraries later
  level: process.env.LOG_LEVEL || 'debug',
  timestamp: true,
};

export class AppLogger extends ConsoleLogger {
  error(message: any, stack?: string, context?: string) {
    // Add custom logic for error logging here
    super.error(message, stack, context);
  }
}
