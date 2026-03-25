import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'secretKey',
  expiresIn: process.env.JWT_EXPIRATION || '3600s',
}));
