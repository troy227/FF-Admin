import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module.js';
import { createValidationPipe } from './common/validation/validation.pipe.js';
import {
  connectDatabase,
  disconnectDatabase,
} from './database/db.js';
import { loadEnvFile } from './load-env.js';

async function bootstrap() {
  loadEnvFile();
  await connectDatabase();

  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(createValidationPipe());
  const port = Number(process.env.PORT ?? 3000);

  const shutdown = async () => {
    await app.close();
    await disconnectDatabase();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  await app.listen(port);
}
await bootstrap();
