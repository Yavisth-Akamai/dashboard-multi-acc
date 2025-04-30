import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'debug', 'log', 'verbose'],
  });

  const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:3001';

  app.enableCors({
    origin: allowedOrigin,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  console.log(`CORS allowed for origin: ${allowedOrigin}`);

  await app.listen(3000);
}
bootstrap();
