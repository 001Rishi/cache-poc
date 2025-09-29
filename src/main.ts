import { NestFactory } from '@nestjs/core';
import { CacheModule } from './cache/cache.module';

async function bootstrap() {
  const app = await NestFactory.create(CacheModule);
  await app.listen(3000);
  console.log('Cache Benchmark POC running on http://localhost:3000');
}
bootstrap();
