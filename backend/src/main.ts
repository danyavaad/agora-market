/*
 * File: main.ts
 * Purpose: Punto de entrada de la aplicación NestJS, configura pipes globales y CORS.
 * Dependencies: AppModule
 * Domain: Core
 */

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // Enable CORS for development
  // app.setGlobalPrefix('api'); // Removed because Nginx strips /api/ before proxying to port 3001
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
