import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  app.enableCors();
  
  // Serve static files
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));
  
  await app.listen(3001);
}
bootstrap();
