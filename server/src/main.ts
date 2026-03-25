import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { swaggerConfig } from './config/swagger.config';
import { AppLogger } from './config/logger.config';
import helmet from 'helmet';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { join } from 'path';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new AppLogger(),
  });

  // Enable CORS for frontend
  app.enableCors();

  // Security headers
  app.use(helmet());

  // Set Global Prefix
  app.setGlobalPrefix('api');

  // Serve static files (avatars)
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Swagger setup
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 9000);
  console.log(`Application is running on: http://localhost:${process.env.PORT ?? 9000}/api`);
  console.log(`Swagger documentation available at: http://localhost:${process.env.PORT ?? 9000}/api/docs`);
}
bootstrap();
