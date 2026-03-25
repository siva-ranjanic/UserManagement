import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const roleModel: Model<any> = app.get(getModelToken('Role'));

  const rolesToCreate = ['Admin', 'User'];

  for (const roleName of rolesToCreate) {
    const existing = await roleModel.findOne({ name: roleName }).exec();
    if (!existing) {
      console.log(`Creating role: ${roleName}`);
      await new roleModel({
        name: roleName,
        permissions: [] // You can add default permission IDs here if you have them
      }).save();
    } else {
      console.log(`Role already exists: ${roleName}`);
    }
  }

  console.log('Role seeding completed.');
  await app.close();
}
bootstrap();
