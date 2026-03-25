import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const roleModel = app.get(getModelToken('Role'));
  const roles = await roleModel.find().exec();
  console.log('Available Roles:');
  console.log(JSON.stringify(roles, null, 2));
  await app.close();
}
bootstrap();
