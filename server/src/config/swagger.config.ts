import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('User Management API')
  .setDescription('API documentation for the User Management system')
  .setVersion('1.0')
  .addBearerAuth()
  .build();
