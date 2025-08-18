// Load environment variables FIRST, before any other imports
import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
  });
  
  await app.listen(3001);
  console.log('🚀 Backend server running on http://localhost:3001');
  console.log('🔗 Database:', process.env.DB_DATABASE);
  console.log('🔗 DB Host:', process.env.DB_HOST);
}
bootstrap();


